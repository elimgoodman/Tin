var sys = require("sys");
var mongodb = require("mongodb");

var page = require("./page");
var util = require("./util");
var _db = require("./db");

exports.createAutoRoutes = function(models, app, config) {
    models.forEach(function(model) {
        app.get("/" + model.name + "/:id", function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                var oid = db.bson_serializer.ObjectID(req.params.id);
                collection.find({_id: oid}, function(err, cursor) {
                    cursor.toArray(function(err, results) {
                        var html = model.render("view.page", results[0], config);
                        page.renderPage(html, res, config);
                    });
                });
            });
        });

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

        app.get("/_forms/" + model.name, function(req, res){
            ret = {};
            ret.html = model.render("form", {}, config);
            ret.success = true;

            util.sendJson(ret, res);
        });


        app.post("/" + model.name + "/delete", function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                var oid = db.bson_serializer.ObjectID(req.body._id);
                collection.remove({_id: oid}, function(err, result){
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
