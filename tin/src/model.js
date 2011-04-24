var fs = require("fs"),
    path = require("path"),
    util = require("./util"),
    page = require("./page"),
    jqtpl = require("jqtpl"),
    mongodb = require("mongodb");

var Model = function(name, path) {
    this.name = name;
    this.path = path;

    this._getMethods();
    this._getPermisssions();
    this._getViews();
}

Model.prototype = {
    
    getFixturesData: function() {
        var fixtures_path = path.join(this.path, "fixtures.json");
        if(path.existsSync(fixtures_path)) {
            return util.readJson(fixtures_path);
        } else {
            return {};
        }
    },

    render: function(context, doc, globals, done) {
        var template_html = this.views[context];
        var data = globals;
        data._this = doc;
        var rendered = jqtpl.tmpl(template_html, data);
        done(rendered);
    },

    populateForm: function(doc, done) {
        this.render("form", {}, function(html){
            util.jQueryify(html, function(window, $){
                Object.keys(doc).forEach(function(key) {
                    $("*[name="+key+"]").val(doc[key]);
                });
                done(window.document.innerHTML);
            });
        });
    },

    _getMethods: function() {
        var methods_file = path.join(this.path, "methods.js");

        if(path.existsSync(methods_file)) {
            var methods = require(methods_file);
            this.methods = methods.methods;
        } else {
            this.methods = {};
        }
    },

    _getViews: function() {

        var self = this;

        var views_file = path.join(this.path, "views.html");
        var views_html = fs.readFileSync(views_file, "utf8");
        var views = {};
        util.jQueryify(views_html, function(window, $){
            //Don't know why jQuery doesn't work here...??
            var blocks = window.document.getElementsByTagName("block");
            for(var i = 0; i < blocks.length; i++) {
                var name = blocks[i].getAttribute("_name");
                views[name] = blocks[i].innerHTML;
            }

          self.views = views;
        });
    },

    _getPermisssions: function() {
        var self = this;
        var perms_file = path.join(this.path, "permissions.json");

        if(path.existsSync(perms_file)) {
            var perms_txt = fs.readFileSync(perms_file, "utf8");
            this.permissions = JSON.parse(perms_txt);
        } else {
            this.permissions = {};
        }

    }
}

exports.generateModels = function(config) {
    var model_names = fs.readdirSync(path.join(config.app_dir, "models"));
    var models = []

    config.models = {};
    model_names.forEach(function(model_name){
        console.log("Registered model " + model_name);

        var model_path = path.join(config.app_dir, "models", model_name);
        var model = new Model(model_name, model_path);
        models.push(model);

        //Also store on config for easy access
        config.models[model_name] = model;
    });

    return models;
}
