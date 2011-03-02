var fs = require("fs");
var auth = require("./auth");

exports.wireUpStaticPages = function(app, config) {

    //Naively wire up index.html
    app.get("/", auth.authUser(config), function(req, res) {
      var filename = config.app_dir + "/index.html";
      serveStatic(filename, res);
    });    
}

serveStatic = function(filename, res) {
  fs.readFile(filename, "binary", function(err, file) {
    if(err) {        
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
    }

    res.writeHead(200);
    res.write(file, "binary");
    res.end();
  });
}
