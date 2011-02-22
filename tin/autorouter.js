var util = require("./util");
var _db = require("./db");
var sys = require("sys");
var mongodb = require("mongodb");

exports.createAutoRoutes = function(models, app, config) {
    models.forEach(function(model) {

        app.get("/" + model.name, function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                collection.find(function(err, cursor) {
                    cursor.toArray(function(err, results) {
                        var snippets = [];
                        results.forEach(function(doc) {
                            if(doc != null) {
                                snippets.push(model.render('view.list', doc, config));
                            }
                        });

                        ret = {};
                        ret.html = snippets.join("");
                        ret.success = true;
                        db.close();

                        util.sendJson(ret, res);
                    });
                });
            });
        });

        app.get("/" + model.name + "/form", function(req, res){
            ret = {};
            ret.html = model.render("form", {}, config);
            ret.success = true;

            util.sendJson(ret, res);
        });


        app.post("/" + model.name + "/delete", function(req, res){
            console.log(req.body);
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                _id = new mongodb.ObjectID(req.body.id);
                collection.remove({_id: _id}, function(err, result){
                    ret = {
                        success: true
                    };

                    util.sendJson(ret, res);
                });
            });
        });

        app.post("/" + model.name, function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                collection.insert(req.body);
                db.close();

                util.sendJson({success: true}, res);
            });
        });
    });
}
