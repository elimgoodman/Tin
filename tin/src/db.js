//TODO: rename to....collection? table?
var mongodb = require("mongodb");
var ErrorDict = require("./error_dict").ErrorDict;

var DB = function(config, model){
    var server = new mongodb.Server(config.db_host, config.db_port, {});
    this.db = new mongodb.Db(config.app_name, server);
    this.coll_name = model.name;
    this.model = model;
    this.coll = null;
};

DB.prototype = {
    _getCollection: function(callback) {
        var self = this;

        if(this.coll != null) {
            callback(this.coll);
        } else {

            this.db.open(function(err, db) {
                if(err != null) {
                    console.log(err);
                }

                db.collection(self.coll_name, function(err, coll){
                    if(err != null) {
                        console.log(err);
                    }
                    self.coll = coll;
                    callback(coll);
                });
            });
        }
    },

    save: function(doc, done) {
        var self = this;
        var errs = new ErrorDict();
        var doc = this.ensureModelField(doc);
        this._getCollection(function(coll) {
            if(self.model.methods._validate) {
                self.model.methods._validate(doc, self, errs, function(errs){
                    if(errs.hasErrors()) {
                        done(errs);
                    } else {
                        coll.save(doc, function(){
                            done(errs);
                        });
                    }
                });
            } else {
                coll.save(doc, function(){
                    done(errs);
                });
            }
        });
    },

    ensureModelField: function(doc) {
        doc._model = this.model.name;
        return doc;
    },

    findById: function(id, done) {
        var self = this;
        this._getCollection(function(coll){
            var oid = self.makeId(id);
            coll.find({_id: oid}, function(err, cursor) {
                cursor.toArray(function(err, results) {
                    done(results[0]);
                });
            });
        });
    },

    close: function() {
        this.db.close();
    },

    makeId: function(id) {
        return this.db.bson_serializer.ObjectID(id);
    }

};

//TODO: remove
exports.getDB = function(config) {
    var server = new mongodb.Server(config.db_host, config.db_port, {});
    return new mongodb.Db(config.app_name, server);
}

//TODO: remove
exports.getCollection = function(db, coll_name, callback) {

    db.open(function(err, db) {
        db.collection(coll_name, callback);
    });
};

exports.DB = DB;
