var fs = require('fs');
var watch = require("watch");

var model = require('./model'); 
var util = require("./util");
var config = require("./config");
var static = require("./static");
var autorouter = require("./autorouter");

var express = require('express');

var app = express.createServer();
app.use(express.bodyDecoder());

var config = config.createConfig(process.argv[2]);

//Wire up static pages
app.use(express.staticProvider(config.app_dir + '/static'));
static.wireUpStaticPages(app, config.app_dir);

//Infer models from dir structure
var models = model.generateModels(config.app_dir);

//Create routes based on models
autorouter.createAutoRoutes(models, app, config);

console.log("Server listening on port " + config.port);
app.listen(config.port);


