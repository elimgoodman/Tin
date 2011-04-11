var fs = require("fs");
var path = require("path");

var jsdom = require("jsdom");
var jqtpl = require("jqtpl");

var util = require("./util");
var auth = require("./auth");

var Page = function(name, path, require_login) {
    this.name = name;
    this.path = path;
    this.require_login = require_login;
    this.html = fs.readFileSync(path, "utf8");
}

Page.prototype = {
    render: function(data) {
        return jqtpl.tmpl(this.html, data);
    }
}

generatePages = function(app_dir, callback) {
    
    var page_dir = path.join(app_dir, "pages");
    var page_names = fs.readdirSync(page_dir);
    var pages = []
    page_names.forEach(function(page_name){
        
        //Is it bad to store these all in memory? Eh.
        var stripped_name = page_name.split(".")[0];
        var page_path = path.join(page_dir, page_name);
        var html = fs.readFileSync(page_path, "utf8");
        var html = util.wrap(html, "div");

        util.jQueryify(html, function(window, $){
            var require_login = $("meta.tin").attr('_require_login') == "true";
            pages.push(new Page(stripped_name, page_path, require_login));
            console.log("Registered page " + stripped_name);
            
            if(pages.length == page_names.length) {
                callback(pages);
            }
        });
    });
}

//FIXME: uhhh cache this
getLayoutHtml = function(config) {
    
    var layout_path = path.join(config.app_dir, "layout.html");
    return fs.readFileSync(layout_path, "utf8");

}

renderPage = function(page, req, res, config) {
  var layout_html = getLayoutHtml(config);
  var globals = getTemplateGlobals(req.session, config);
  var html = page.render(globals);

  util.jQueryify(layout_html, function(window, $){

    $("block.tin[_name='content']").html(html);
    res.writeHead(200);
    res.write(window.document.innerHTML, "utf8");
    res.end();
  });
}

getTemplateGlobals = function(session, config) {
    var globals = {};
    
    if(config.auth.enabled) {
        globals._user = session.user;
    }

    return globals;
}

exports.wireUpPages = function(app, config) {
    
    generatePages(config.app_dir, function(pages) {
        pages.forEach(function(page){
            var url = (config.index_page == page.name) ? "/" : "/" + page.name;

            app.get(url, auth.authUser(page, config), function(req, res){
              renderPage(page, req, res, config);
            });
        });
    });  
}

exports.renderPage = renderPage;


