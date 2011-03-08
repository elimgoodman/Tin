var fs = require("fs"),
    path = require("path"),
    util = require("./util"),
    mu = require("mustache"),
    mongodb = require("mongodb");

var Model = function(name, path) {
    this.name = name;
    this.path = path;

    this.methods = this._getMethods();
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

    render: function(context, data, callback) {
        var template = path.join(this.path, "views.html");
        var html = fs.readFileSync(template, "utf8");
        
        util.jQueryify(html, function(window, $){
          var template_html = $("block.tin[_name=" + context + "]").html();
          var rendered = mu.to_html(template_html, data);
          callback(rendered);
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
