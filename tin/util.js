var fs = require('fs');
var jsdom = require('jsdom');

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

exports.jq = function() {
    return ["/js/lib/jquery.js", "/js/lib/jquery.metadata.js"];
}

exports.jQueryify = function(html, callback) {
    
      var window = jsdom.jsdom(html).createWindow();

      jsdom.jQueryify(window, './lib/jquery.js' , function() {
          callback(window, window.$);
      });
}

exports.wrap = function(html, wrapper) {
    return "<"+wrapper+">" + html + "</"+wrapper+">";
}

//From underscore.js...
exports.merge = function(target) {
  var i = 1, length = arguments.length, source;
  for ( ; i < length; i++ ) {
    // Only deal with defined values
    if ( (source = arguments[i]) != undefined ) {
      Object.getOwnPropertyNames(source).forEach(function(k){
        var d = Object.getOwnPropertyDescriptor(source, k) || {value:source[k]};
        if (d.get) {
          target.__defineGetter__(k, d.get);
          if (d.set) target.__defineSetter__(k, d.set);
        }
      else if (target !== d.value) {
        target[k] = d.value;
      }
      });
    }
  }
  return target;
};

