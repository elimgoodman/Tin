var fs = require('fs');

var express = require('express');

var model = require('./model'); 
var util = require("./util");
var config = require("./config");
var static = require("./static");
var autorouter = require("./autorouter");
var auth = require("./auth");

var app = express.createServer();
app.use(express.bodyDecoder());

var config = config.createConfig(process.argv[2]);

//If auto-auth is on, enable session middleware
if(config.auth) {
    app.use(express.cookieDecoder());
    app.use(express.session({secret: 'foo'}));
}

//Wire up static pages
app.use(express.staticProvider(config.app_dir + '/static'));
static.wireUpStaticPages(app, config);

//Infer models from dir structure
var models = model.generateModels(config.app_dir);

//Create routes based on models
autorouter.createAutoRoutes(models, app, config);

console.log("Server listening on port " + config.port);
app.listen(config.port);


