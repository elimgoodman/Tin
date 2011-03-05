var fs = require("fs"),
    path = require("path"),
    util = require("./util"),
    mu = require("mustache"),
    mongodb = require("mongodb");

var Model = function(name) {
    this.name = name;
}

Model.prototype = {
    
    getFixturesData: function(app_dir) {
        var model_path = this.getPath(app_dir);
        var fixtures_path = path.join(model_path, "fixtures.json");
        if(path.existsSync(fixtures_path)) {
            return util.readJson(fixtures_path);
        } else {
            return {};
        }
    },

    getPath: function(app_dir) {
        return path.join(app_dir, "models", this.name);
    },

    render: function(context, data, config) {
        var template = path.join(this.getPath(config.app_dir), context + ".html");
        var template_text = fs.readFileSync(template, "ascii");

        return mu.to_html(template_text, data);
    }

}

exports.generateModels = function(app_dir) {
    var model_names = fs.readdirSync(path.join(app_dir, "models"));
    var models = []
    model_names.forEach(function(model_name){
        console.log("Registered model " + model_name);
        models.push(new Model(model_name));
    });

    return models;
}
