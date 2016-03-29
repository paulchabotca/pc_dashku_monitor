'use strict';
// This populates the WidgetTemplates collection with Widget Templates
//
// WARNING - This will clear any previous widget templates that exist in the DB



// Dependencies
//
var fs                    = require('fs');
var ss                    = require('socketstream');
require('../server/internals');
var WidgetTemplate        = ss.api.app.models.WidgetTemplate;



function handleCb (widgetTemplate, files, i, cb) {
	widgetTemplate.save(function (err) {
		if (err) {
			console.log('There was an error populating the WidgetTemplate collection');
			cb(err);
		} else {
			if (i === files.length-1) {
				cb(err);
			}
		}
	});
}



var populateWidgetTemplates = function (cb) {
	console.log('Clearing the WidgetTemplates collection');
	WidgetTemplate.remove({}, function (err) {
		if (err === null) {
			fs.readdir(__dirname + '/../server/seed/widgetTemplates', function (err, files) {
				if (err === null && files) {

					for (var i=0;i<files.length;i++) {

						var file = files[i];

						var widgetTemplate = new WidgetTemplate(require(__dirname + '/../server/seed/widgetTemplates/' + file));
						handleCb(widgetTemplate, files, i, cb);
					}
				}
			});
		} else {
			cb(new Error('There was an error clearing the WidgetTemplates collection'));
		}
	});
};



populateWidgetTemplates(function (err) {
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log('Finished populating the widget templates');
		process.exit(0);
	}
});