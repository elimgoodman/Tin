var fs = require("fs"),
    path = require("path"),
    util = require("./util"),
    mu = require("mustache"),
    mongodb = require("mongodb");

var Model = function(name, path) {
    this.name = name;
    this.path = path;

    this.methods = this._getMethods();
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

    render: function(context, data, done) {
        var template_html = this.views[context];
        var rendered = mu.to_html(template_html, data);
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
            return methods.methods;
        } else {
            return {}
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
    }
}

exports.generateModels = function(app_dir) {
    var model_names = fs.readdirSync(path.join(app_dir, "models"));
    var models = []
    model_names.forEach(function(model_name){
        console.log("Registered model " + model_name);

        var model_path = path.join(app_dir, "models", model_name);
        models.push(new Model(model_name, model_path));
    });

    return models;
}
