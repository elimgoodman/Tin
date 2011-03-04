var util = require("./util");
var _db = require("./db");
var crypt = require("./crypt");

exports.authUser = function(config) {
  return function(req, res, next) {
    if(config.auth.enabled) {
        if(req.session.user == undefined) {
            res.redirect("/login");
        }
    }
    next();
  }
}

exports.wireUpAuth = function(app, config) {
    
    app.get("/login", function(req, res){
        //TODO: make this use config
        var filename = config.app_dir + "/auth/login.html";
        util.serveStatic(filename, res);
    });

    app.get('/logout', function(req, res){
        req.session.user = undefined;
        res.redirect("/");
    });

    app.post("/authorize", function(req, res){
        var db = _db.getDB(config);
        _db.getCollection(db, config.auth.user_model, function(err, collection){
            var params = {
                login_name: req.body.login_name,
            }
            console.log(params);
            collection.find(params, function(err, cursor) {
                cursor.toArray(function(err, results){
                    console.log(results);
                    if(results[0].password == req.body.password) {
                        req.session.user = results[0];
                        res.redirect("/");
                    } else {
                        //TODO: some sorta flash message
                        res.redirect("/login");
                    }
                });
            });
        });
    });

}
