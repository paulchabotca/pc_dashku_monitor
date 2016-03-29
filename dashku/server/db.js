'use strict';



// Dependencies
//
var mongoose   = require('mongoose');
var redis      = require('redis');
var ss         = require('socketstream');



// Attach the database adapters via a function
//
module.exports = function (app) {

	// Redis-related configuration
	app.Redis = redis.createClient(app.config.redis.port, app.config.redis.host);
	
	if (app.config.redis.pass) {
		app.Redis.auth(app.config.redis.pass);
	}
	
	// MongoDB-related configuration
	mongoose.connect(app.config.db);
	require(__dirname + '/models/user')(app);
	require(__dirname + '/models/widget')(app);
	require(__dirname + '/models/dashboard')(app);
	require(__dirname + '/models/widgetTemplate')(app);

};