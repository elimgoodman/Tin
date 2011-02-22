var fs = require("fs");

exports.wireUpStaticPages = function(app, app_dir) {

    //Naively wire up index.html
    app.get("/", function(req, res) {
      var filename = app_dir + "/index.html";
      serveStatic(filename, res);
    });    
    
    //app.get("/js/:filename", function(req, res) {
      //var filename = app_dir + "/static/js/" + req.params.filename;
      //console.log(filename);
      //serveStatic(filename, res);
    //});
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
