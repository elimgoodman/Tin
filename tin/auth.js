var path = require("path");

var util = require("./util");
var _db = require("./db");
var crypt = require("./crypt");

exports.authUser = function(page, config) {
  return function(req, res, next) {
    if(config.auth.enabled && page.require_login) {
        if(req.session.user == undefined) {
            res.redirect("/login");
        }
    }
    next();
  }
}

exports.wireUpAuth = function(app, config) {
    
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
            collection.find(params, function(err, cursor) {
                cursor.toArray(function(err, results){
                    if(results.length > 0 && results[0].password == req.body.password) {
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
