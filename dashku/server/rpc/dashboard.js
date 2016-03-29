'use strict';
/* Dashboard rpc module */


// Dependencies
//
var _                     = require('underscore');



// Expose the public API
//
exports.actions = function (req, res, ss) {

	var dashboardController   = ss.app.controllers.dashboard;
	var Dashboard             = ss.app.models.Dashboard;
	var fetchUserFromSession  = ss.app.helpers.fetchUserFromSession;

	req.use('session');

	return {

		create: function (data) {
			fetchUserFromSession(req, res, function (user) {
				dashboardController.create({name: data.name, userId: user._id}, res);
			});
		},

		getAll: function () {
			fetchUserFromSession(req, res, function (user) {
				dashboardController.getAll({userId: user._id}, res);
			});
		},

		externalGet: function (id) {
			dashboardController.get({_id: id}, function (response) {
				if (response.status === 'success') {
					req.session.channel.subscribe('user_' + response.dashboard.userId);
				}
				res(response);
			});
		},

		update: function (conditions) {
			if (conditions === null || conditions === undefined) {
				conditions = {};
			}

			fetchUserFromSession(req, res, function (user) {
				dashboardController.update(_.extend(conditions, {userId: user._id}), res);
			});
		},

		delete: function (id) {
			fetchUserFromSession(req, res, function (user) {
				dashboardController.delete({id: id, userId: user._id}, res);
			});
		},

		// I'm not going to port this RPC method to the HTTP API for now, I don't think there's much need for that ATM.
		updateWidgetPositions: function (data) {
			fetchUserFromSession(req, res, function (user) {
				Dashboard.findOne({_id: data._id}, function (err, dashboard) {

					if (err === null && dashboard !== undefined) {

						var saveDashboard = function () {
							dashboard.save(function (err) {
								if (err === null) {
									ss.publish.channel('user_' + user._id, 'widgetPositionsUpdated', {_id: dashboard._id, positions: data.positions});
									res({status: 'success'});
								} else {
									res({status: 'failure', reason: err});
								}
							});
						};


						for (var i=0;i<dashboard.widgets.length;i++) {
							var widget      = dashboard.widgets[i];
							widget.position = data.positions[widget._id];

							if (i === dashboard.widgets.length-1) {
								saveDashboard();
							}
						}

					} else {
						var reason;
						if (err !== null) { reason = err.message; }
						if (dashboard === undefined) { reason = 'Dashboard not found'; }
						res({status: 'failure', reason: reason});
					}
				});
			});
		}

	};
};