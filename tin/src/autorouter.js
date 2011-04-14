var sys = require("sys");
var mongodb = require("mongodb");

var page = require("./page");
var util = require("./util");
var _db = require("./db"); //FIXME: eventually just include DB obj
var ErrorDict = require("./error_dict").ErrorDict;
var Permissioner = require("./permissioner").Permissioner;

exports.createAutoRoutes = function(models, app, config) {
    models.forEach(function(model) {

        app.get("/" + model.name, function(req, res){
            var db = _db.getDB(config);
            _db.getCollection(db, model.name, function(err, collection) {
                collection.find(function(err, cursor) {
                    cursor.toArray(function(err, results) {
                        var snippets = [];
                        var permer = new Permissioner(config, model);
                        results = results.filter(function(d) {
                            return permer.isViewable(d, req.session);
                        });
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
                    DB.close();
                    util.sendJson({html: html}, res);
                });
            });
        });

        app.get("/" + model.name + "/:_id", function(req, res){
            var DB = new _db.DB(config, model);
            DB.findById(req.params._id, function(doc){
                
                var permer = new Permissioner(config, model);
                if(!permer.isViewable(doc, req.session)){
                    res.redirect("/");
                    return;
                };

                model.render("page", doc, function(html){

                    DB.close();
                    page.renderHTML(html, req, res, config);
                });
            });
        });

        //FIXME: change to 'delete' method
        //FIXME: SUXX
        //FIXME: use refactored DB
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
            var permer = new Permissioner(config, model);

            //We have to pull the doc out of the DB to check the owner..
            DB.findById(req.params._id, function(doc) {
                if(permer.isEditable(doc, req.session)){
                    
                    var modified = doc;

                    for(key in req.body) {
                        modified[key] = req.body[key];
                    };

                    DB.save(modified, function(errs){

                        var ret = {
                            success: !errs.hasErrors(), 
                            errors: errs.getErrors()
                        };

                        DB.close();
                        util.sendJson(ret, res);
                    });
                } else {

                    var ret = {
                        success: false, 
                        errors: {} // what to put here?
                    };

                    DB.close();
                    util.sendJson(ret, res);
                }
            });

        });

        app.post("/" + model.name, function(req, res){
            
            //Add owner info if necessary
            var permer = new Permissioner(config, model);
            var doc = permer.addOwner(req.body, req.session);

            var DB = new _db.DB(config, model);
            DB.save(doc, function(errs){

                var ret = {
                    success: !errs.hasErrors(), 
                    errors: errs.getErrors()
                };

                DB.close();
                util.sendJson(ret, res);

            });
        });
    });
}
