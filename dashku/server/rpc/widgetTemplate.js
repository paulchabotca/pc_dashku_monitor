'use strict';
/* Widget Template RPC module */



// Dependencies
//
var ss              = require('socketstream');
var WidgetTemplate  = ss.api.app.models.WidgetTemplate;



// Expose the Publice API
//
exports.actions = function (req, res) {

	return {
		getAll: function () {
			WidgetTemplate.find({}, function (err, widgetTemplates) {
				if (err === null) {
					res({status: 'success', widgetTemplates: widgetTemplates});
				} else {
					res({status: 'failure', reason: err});
				}
			});
		}
	};

};
