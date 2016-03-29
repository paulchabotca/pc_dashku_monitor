'use strict';



// Controllers, a way of sharing common logic between RPC and REST APIs
var ss                   = require('socketstream');
var dashboardController  = ss.api.app.controllers.dashboard;
var widgetController     = ss.api.app.controllers.widget;
var Redis                = ss.api.app.Redis;



/* The Dashku REST API */



// Fetch the API Key from Redis
var apiKeyRequest = function (apiKey, res, successFunction) {
	Redis.hget('apiKeys', apiKey, function (err, userId) {
		if (err === null && userId) {
			successFunction(userId);
		} else {
			var reason = userId? err : 'Couldn\'t find a user with that API key';
			var content = JSON.stringify({status: 'failure', reason: reason});
			res.statusCode = 401;
			res.setHeader('Content-Type','application/json');
			res.end(content);
		}
	});
};



// A helper function that generates the JSON response
var applyStatusCodesToResponse = function (res, response, statusCode, responseObject) {

	if (!statusCode) { statusCode = 200; }

	var content;

	if (response.status === 'success') {

		content = JSON.stringify(responseObject || response);
		res.statusCode  = statusCode;
		res.setHeader('Content-Type','application/json');
		res.end(content);

	} else {

		content = JSON.stringify(responseObject || response);
		res.statusCode  = 400;
		res.setHeader('Content-Type','application/json');
		res.end(content);

	}

};


module.exports = function (router) {



	router.post('/api/transmission', function (req, res) {
		var apiKey = req.body.apiKey || req.query.apiKey;
		apiKeyRequest(apiKey, res, function (userId) {
			ss.api.publish.channel('user_'+userId, 'transmission', req.body);
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write(JSON.stringify({status: 'success'}));
			res.end();
		});
	});



	router.get('/api/dashboards', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function (userId) {
			dashboardController.getAll({userId: userId}, function (response) {
				applyStatusCodesToResponse(res, response, 200, response.dashboards);
			});
		});
	});



	router.get('/api/dashboards/:id', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function (userId) {
			dashboardController.get({userId: userId, _id: req.params.id}, function (response) {
				applyStatusCodesToResponse(res, response, 200, response.dashboard);
			});
		});
	});



	router.post('/api/dashboards', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function (userId) {
			dashboardController.create({name: req.body.name, userId: userId}, function (response) {
				applyStatusCodesToResponse(res, response, 202, response.dashboard);
			});
		});
	});



	router.put('/api/dashboards/:id', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function (userId) {
			var dashboard     = req.body;
			dashboard._id     = req.params.id;
			dashboard.userId  = userId;
			dashboardController.update(dashboard, function (response) {
				applyStatusCodesToResponse(res, response, 201, response.dashboard);
			});
		});
	});



	router.delete('/api/dashboards/:id', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function (userId) {
			dashboardController.delete({userId: userId, id: req.params.id}, function (response) {
				applyStatusCodesToResponse(res, response, 201);
			});
		});
	});



	router.post('/api/dashboards/:dashboardId/widgets', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function (userId) {
			var data = req.body;
			data.dashboardId = req.params.dashboardId;
			widgetController.create(data, {_id: userId, apiKey: req.query.apiKey}, function (response) {
				applyStatusCodesToResponse(res, response, 202, response.widget);
			});
		});
	});



	router.put('/api/dashboards/:dashboardId/widgets/:id', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function () {
			var data = req.body;
			data._id = req.params.id;
			data.dashboardId = req.params.dashboardId;
			widgetController.update(data, function (response) {
				applyStatusCodesToResponse(res, response, 201, response.widget);
			});
		});
	});



	router.delete('/api/dashboards/:dashboardId/widgets/:id', function (req, res) {
		apiKeyRequest(req.query.apiKey, res, function () {
			widgetController.delete({dashboardId: req.params.dashboardId, _id: req.params.id}, function (response) {
				applyStatusCodesToResponse(res, response, 201);
			});
		});
	});



	router.get('/api/dashboards/:dashboardId/widgets/:id/downloads/:format', function (req, res) {
		require(__dirname + '/scriptDownloader')(req, res);
	});



};