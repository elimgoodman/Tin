var sys = require("sys");
var mongodb = require("mongodb");

var page = require("./page");
var util = require("./util");
var _db = require("./db");
var ErrorDict = require("./error_dict").ErrorDict;

exports.createAutoRoutes = function(models, app, config) {
    models.forEach(function(model) {

        app.get("/" + model.name, function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                collection.find(function(err, cursor) {
                    cursor.toArray(function(err, results) {
                        var snippets = [];
                        results = results.filter(function(d) { return d != null; });
                        results.forEach(function(doc) {
                            model.render('list', doc, function(html){
                                snippets.push(html);

                                if(snippets.length == results.length) {
                                    ret = {};
                                    ret.html = snippets.join("");
                                    ret.success = true;
                                    db.close();

                                    util.sendJson(ret, res);
                                }
                            });
                        });
                    });
                });
            });
        });

        app.get("/_forms/" + model.name, function(req, res){
            ret = {};
            ret.success = true;
            model.render("form", {}, function(html){
                ret.html = html;
                util.sendJson(ret, res);
            });

        });

        app.get("/" + model.name + "/:_id", function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                var oid = db.bson_serializer.ObjectID(req.params._id);
                collection.find({_id: oid}, function(err, cursor) {
                    cursor.toArray(function(err, results) {
                        model.render("page", results[0], function(html){
                            page.renderPage(html, res, config);
                        });
                    });
                });
            });
        });

        //FIXME: change to 'delete' method
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

                if(model.methods._validate) {
                    var errs = new ErrorDict();
                    model.methods._validate(req.body, db, errs, function(errs){
                        if(errs.hasErrors()) {
                            var ret = {};
                            var errs_dict = errs.getErrors();
                            ret.success = false;
                            ret.errors = errs_dict;
                            util.sendJson(ret, res);
                        } else {
                        
                            //FIXME: DRY
                            collection.insert(req.body);
                            db.close();

                            util.sendJson({success: true}, res);
                        }
                    });
                } else {
                    collection.insert(req.body);
                    db.close();

                    util.sendJson({success: true}, res);
                }
            });
        });
    });
}
