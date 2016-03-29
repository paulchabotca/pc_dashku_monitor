/* Widget RPC module */
'use strict';



// Export the Public API
//
exports.actions = function (req, res, ss) {

	var widgetController      = ss.app.controllers.widget;
	var fetchUserFromSession  = ss.app.helpers.fetchUserFromSession;

	req.use('session');

	return {
		create: function (data) {
			fetchUserFromSession(req, res, function (user) {
				widgetController.create(data, user, res);
			});
		},

		update: function (data) {
			fetchUserFromSession(req, res, function () {
				widgetController.update(data, res);
			});
		},

		delete: function (data) {
			fetchUserFromSession(req, res, function () {
				widgetController.delete(data, res);
			});
		}

	};

};