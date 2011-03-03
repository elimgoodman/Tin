var util = require("./util");
var _db = require("./db");
var crypt = require("./crypt");

exports.authUser = function(config) {
  return function(req, res, next) {
    if(config.auth.enabled) {
        console.log(req.session.user_id);
        if(req.session.user_id == undefined) {
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
        req.session.user_id = undefined;
        res.redirect("/");
    });

    app.post("/authorize", function(req, res){
        var db = _db.getDB(config);
        _db.getCollection(db, config.auth.model, function(err, collection){
            var params = {
                login_name: req.body.login_name,
                password: req.body.password
                //password: crypt.encrypt(req.body.password)
            }
            console.log(params);
            collection.find(params, function(err, cursor) {
                cursor.toArray(function(err, results){
                    console.log(results);
                    if(results.length == 0) {
                        //TODO: some sorta flash message
                        res.redirect("/login");
                    } else {
                        oid = new _db.oid(results[0]._id.id);
                        req.session.user_id = oid.toHexString();
                        console.log(req.session.user_id);
                        res.redirect("/");
                    }
                });
            });
        });
    });

}
