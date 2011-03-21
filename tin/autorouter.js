var sys = require("sys");
var mongodb = require("mongodb");

var page = require("./page");
var util = require("./util");
var _db = require("./db"); //FIXME: eventually just include DB obj
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

        app.get("/_form/" + model.name, function(req, res){
            ret = {};
            ret.success = true;

            model.render("form", {}, function(html){
                ret.html = html;
                util.sendJson(ret, res);
            });
        });

        app.get("/_form/" + model.name + "/:_id", function(req, res) {
        
            var DB = new _db.DB(config, model);
            DB.findById(req.params._id, function(doc) {
                //TODO: is model the right place for this?
                model.populateForm(doc, function(html){
                    ret.html = html;

                    DB.close();
                    util.sendJson(ret, res);
                });
            });
        });

        app.get("/" + model.name + "/:_id", function(req, res){
            var DB = new _db.DB(config, model);
            DB.findById(req.params._id, function(doc){
                model.render("page", doc, function(html){

                    DB.close();
                    page.renderPage(html, res, config);
                });
            });
        });

        //FIXME: change to 'delete' method
        //FIXME: SUXX
        app.post("/_method/" + model.name + "/delete", function(req, res){
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

        Object.keys(model.methods).forEach(function(method){
            console.log("Registered method " + method + " on model " + model.name);
            app.post("/_method/" + model.name + "/" + method, function(req, res){

                var DB = new _db.DB(config, model);
                model.methods[method](req.body, DB, function(ret){
                    util.sendJson(ret, res);
                });
            });
        });

        //Technically this should be put...meh
        app.post("/" + model.name + "/:_id", function(req, res){
            var DB = new _db.DB(config, model);
            DB.save(util.merge({_id: req.params._id}, req.body), function(errs){
                if(errs.hasErrors()) {
                    util.sendJson(util.merge(
                        {success: false}, errs.getErrors()
                    ), res);
                } else {
                    util.sendJson({success: true}, res);
                }
            });
        });

        //FIXME: REFACTOR + TEST THIS YO
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
