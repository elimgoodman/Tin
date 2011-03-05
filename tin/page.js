var fs = require("fs");
var path = require("path");

var jsdom = require("jsdom");
var mu = require("mustache");

var util = require("./util");
var auth = require("./auth");

var Page = function(name, html, metadata) {
    this.name = name;
    this.html = html;
    this.metadata = metadata;
}

wrap = function(html) {
    return "<div>" + html + "</div>";
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
        var html = wrap(html);

        util.jQueryify(html, function(window, $){
            var tin_str = $(html).find("meta").attr('tin');
            var metadata = (tin_str != undefined) ? JSON.parse(tin_str) : {};
            pages.push(new Page(stripped_name, html, metadata));
            console.log("Registered page " + stripped_name);
            
            if(pages.length == page_names.length) {
                callback(pages);
            }
        });
    });
}

getLayoutHtml = function(config) {
    
    var layout_path = path.join(config.app_dir, "layout.html");
    return fs.readFileSync(layout_path, "utf8");

}

exports.wireUpPages = function(app, config) {
    
    generatePages(config.app_dir, function(pages) {
        pages.forEach(function(page){
            var url = (config.index_page == page.name) ? "/" : "/" + page.name;

            app.get(url, auth.authUser(page, config), function(req, res){
              var layout_html = getLayoutHtml(config);

              util.jQueryify(layout_html, function(window, $){
                $("block[name='content']").html(page.html);
                res.writeHead(200);
                res.write(window.document.innerHTML, "utf8");
                res.end();
              });
            });
            
        });
    });  

}


