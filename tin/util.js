var fs = require('fs');

exports.pluralize = function(str) {
    //FIXME: this can get more complicated..
    return str + "s";
}

exports.readJson = function(filename) {
    data = fs.readFileSync(filename);
    return JSON.parse(data);
}

exports.sendJson = function(obj, res) {
    res.contentType('application/json');
    res.send(JSON.stringify(obj));
}

exports.fromBase64 = function(str) { 
  return (new Buffer(str, "base64")).toString("ascii");
};

exports.toBase64 = function(str) {
  return  (new Buffer(str, "ascii")).toString("base64");
};

exports.serveStatic = function(filename, res) {
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
