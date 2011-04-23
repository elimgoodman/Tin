var config = require("./config");
var model = require('./model'); 
var fixtures = require('./fixtures'); 

var config = config.createConfig(process.argv[2]);

var models = model.generateModels(config);

fixtures.runFixtures(models, config);
