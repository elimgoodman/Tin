var fs = require("fs");
var path = require("path");

var jsdom = require("jsdom");
var jqtpl = require("jqtpl");

var util = require("./util");
var auth = require("./auth");
var Permissioner = require("./permissioner.js").Permissioner;

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
  var globals = getTemplateGlobals(req.session, config);
  var html = page.render(globals);
  renderHTML(html, req, res, config);
}

renderHTML = function(html, req, res, config) {
  var layout_html = getLayoutHtml(config);

  util.jQueryify(layout_html, function(window, $){

    $("block.tin[_name='content']").html(html);
    res.writeHead(200);
    res.write(window.document.innerHTML, "utf8");
    res.end();
  });
},

//FIXME: put this somewhere better (globals.js?)
getTemplateGlobals = function(session, config) {
    var globals = {};
    
    if(config.auth.enabled) {
        if(session.user != undefined) {
            globals._user = session.user;

            //TODO: can't think of a more elegant way to do this...
            globals._user.canView = function(doc) {
                var model = config.models[doc._model];
                var permer = new Permissioner(config, model);
                return permer.isViewable(doc, session);
            };

            globals._user.canEdit = function(doc) {
                var model = config.models[doc._model];
                var permer = new Permissioner(config, model);
                return permer.isEditable(doc, session);
            };
        } else {
            globals._user = {};
        }
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

exports.renderHTML = renderHTML;
exports.getTemplateGlobals = getTemplateGlobals;;


