var fs = require("fs"),
    path = require("path");
var _=require("./underscore");
var util = require('./util');

var Config = function(filename) {
  this.config_file = filename;
  this.config_path = fs.realpathSync(this.config_file);
  this.app_dir = path.dirname(this.config_path);

  _.extend(this, util.readJson(this.config_file));
}

Config.prototype = {}

exports.createConfig = function(filename) {
    return new Config(filename);
}

