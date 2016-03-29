'use strict';

// The Dashboard controller ####



// Dependencies
//
var ss = require('socketstream');



// Expose the module as the application
//
module.exports = function (app) {



	var Dashboard = app.models.Dashboard;



	app.controllers.dashboard = {


	
		create: function (data, cb) {
			var dashboard = new Dashboard(data);
			dashboard.save( function (err, doc) {
				if (err === null) {
					ss.api.publish.channel('user_'+data.userId, 'dashboardCreated', doc);
					cb({status: 'success', dashboard: doc});
				} else {
					cb({status: 'failure', reason: err.message});
				}
			});
		},



		getAll: function (data, cb) {
			Dashboard.find(data, {}, {sort: {name: 1}}, function (err, dashboards) {
				if (err === null && dashboards !== null) {
					cb({status: 'success', dashboards: dashboards});
				} else {
					cb({status: 'failure', reason: err});
				}
			});
		},



		get: function (data, cb) {
			Dashboard.findOne(data, function (err, dashboard) {
				if (err === null && dashboard !== null) {
					cb({status: 'success', dashboard: dashboard});
				} else {
					var reason = dashboard !== undefined ? err : 'Dashboard not found';
					cb({status: 'failure', reason: reason});
				}
			});
		},



		update: function (data, cb) {
			Dashboard.findOne({_id: data._id, userId: data.userId}, function (err, dashboard) {
				if (err === null && dashboard !== null) {

					var key, value;

					for (key in data) {
						value = data[key];
						dashboard[key] = value;
					}
					dashboard.updatedAt = Date.now();
					dashboard.save(function (err, dashboard) {

						if (err === null) {
							// NOTE - My opinion is that models is a natural place for PubSub events
							// like this one. I may change this in the future
							ss.api.publish.channel('user_' + data.userId, 'dashboardUpdated', dashboard);
							cb({status: 'success', dashboard: dashboard});
						} else {
							cb({status: 'failure', reason: err});
						}
					});

				} else {
					var reason = dashboard !== undefined ? err : 'Dashboard not found';
					cb({status: 'failure', reason: reason});
				}
			});
		},



		delete: function (data, cb) {
			Dashboard.find({userId: data.userId}, function (err, dashboards) {

				if (err === null && dashboards.length > 1) {
					Dashboard.remove({_id: data.id, userId: data.userId}, function (err) {
						if (err === null) {
							ss.api.publish.channel('user_'+ data.userId, 'dashboardDeleted', data.id);
							cb({status: 'success', dashboardId: data.id});
						} else {
							cb({status: 'failure', reason: 'Dashboard not found'});
						}
					});
				} else {
					cb({status: 'failure', reason: err || 'You can\'t delete your last dashboard'});
				}

			});
		}

	};

};