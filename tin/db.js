var mongodb = require("mongodb");

exports.getDB = function(config) {
    var server = new mongodb.Server(config.db_host, config.db_port, {});
    return new mongodb.Db(config.app_name, server);
}

exports.getCollection = function(db, coll_name, callback) {
    
    db.open(function(err, db) {
        db.collection(coll_name, callback);
    });
}

exports.oid = mongodb.ObjectID;
