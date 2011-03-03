var fs = require("fs");

var util = require("./util");
var auth = require("./auth");

exports.wireUpStaticPages = function(app, config) {

    //Naively wire up index.html
    app.get("/", auth.authUser(config), function(req, res) {
      var filename = config.app_dir + "/index.html";
      util.serveStatic(filename, res);
    });    
}


