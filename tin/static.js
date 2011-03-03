var fs = require("fs");

var $ = require("jquery");
//var jsdom = require("jsdom");

var util = require("./util");
var auth = require("./auth");

exports.wireUpStaticPages = function(app, config) {

    //Naively wire up index.html
    app.get("/", auth.authUser(config), function(req, res) {
      var filename = config.app_dir + "/index.html";
      
      var html = fs.readFileSync(filename, "utf8");
      //var window = jsdom.jsdom(html).createWindow();

      //jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.4.2.min.js' , function() {
          //window.
          //window.$('body').append('<div class="testing">Hello World, It works</div>');
      //});

      var dom = $(html);
      //dom.remove("hr");
      
      //$(html).find(".tin").each(function(){
          //var tin = $(this).attr("tin");
          //console.log(tin);
          //FIXME: eval nooooo
          //console.log(eval("("+tin+")"));
      //});

      res.writeHead(200);
      console.log(dom[0].innerHTML);
      res.write(dom[0].innerHTML, "utf8");
      res.end();
      //util.serveStatic(filename, res);
    });    
}


