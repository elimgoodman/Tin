//TODO: rename to....collection? table?
var mongodb = require("mongodb");

var DB = function(config, coll_name){
    var server = new mongodb.Server(config.db_host, config.db_port, {});
    this.db = new mongodb.Db(config.app_name, server);
    this.coll_name = coll_name;
    this.coll = null;
};

DB.prototype = {
  _getCollection: function(callback) {
    var self = this;

    if(this.coll != null) {
        callback(this.coll);
    } else {

      this.db.open(function(err, db) {
        db.collection(self.coll_name, function(err, coll){
            self.coll = coll;
            callback(coll);
        });
      });
    }
  },

  save: function(doc, done) {
    this._getCollection(function(coll) {
        coll.save(doc);
        done();
    });
  },

  findById: function(id, done) {
    var self = this;
    this._getCollection(function(coll){
        var oid = self.db.bson_serializer.ObjectID(id);
        coll.find({_id: oid}, function(err, cursor) {
            cursor.toArray(function(err, results) {
                done(results[0]);
            });
        });
    });
  },

  close: function() {
    this.db.close();
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
