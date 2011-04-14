var _db = require("./db");
//var db = require("mongous").Mongous;
var _= require("./underscore");

var getFixturesData = function(models, config) {
    fixtures = {}
    models.forEach(function(model){
        fixtures[model.name] = 
          model.getFixturesData(config.app_dir);
    });

    return fixtures;
}

//FIXME: use DB obj
var insertFixtures = function(fixtures, config) {
    var model_names = _.keys(fixtures);

    var num_models = model_names.length;
    var i = 0;
    var db = _db.getDB(config);
    db.open(function(err, db){
        model_names.forEach(function(model_name){
            db.dropDatabase(function(err, result){
                console.log("Dropping collection " + model_name);

                db.collection(model_name, function(err, collection) {
                    console.log("Creating collection " + model_name);

                    collection.insert(fixtures[model_name]);
                    console.log("Inserted " + fixtures[model_name].length + " records");

                    i++;

                    if(i == num_models) {
                        db.close();
                    }
                });
            }); 
        });
    });
}

exports.runFixtures = function(models, config) {
    fixtures = getFixturesData(models, config);

    insertFixtures(fixtures, config);
}


