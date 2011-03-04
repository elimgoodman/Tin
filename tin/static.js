var fs = require("fs");

//var $ = require("jquery");
var jsdom = require("jsdom");

var util = require("./util");
var auth = require("./auth");

exports.wireUpStaticPages = function(app, config) {

    //Naively wire up index.html
    app.get("/", auth.authUser(config), function(req, res) {
      var filename = config.app_dir + "/index.html";
      
      var html = fs.readFileSync(filename, "utf8");
      var window = jsdom.jsdom(html).createWindow();

      jsdom.jQueryify(window, './lib/jquery.js' , function() {
          var $ = window.$;
          $('body').append('<div class="testing">Hello World, It works</div>');
          $('.tin').each(function(){
              var tin = $(this).attr("tin");
              var elem = $(this);
              console.log(JSON.parse(tin));
              if(elem.is("span")) {
                  if(req.session.user != undefined) {
                      elem.html(req.session.user.login_name);
                  }
              }

          });

          res.writeHead(200);
          res.write(window.document.innerHTML, "utf8");
          res.end();
      });

      //var dom = $(html);
      //dom.remove("hr");
      
      //$(html).find(".tin").each(function(){
          //var tin = $(this).attr("tin");
          //console.log(tin);
          //FIXME: eval nooooo
          //console.log(eval("("+tin+")"));
      //});

      //util.serveStatic(filename, res);
    });    
}


