/* WidgetTemplate model */
'use strict';



// Dependencies
//
var mongoose = require('mongoose');



// Expose the public API as a function to bind onto the app
//
module.exports = function (app) {

	app.schemas.WidgetTemplates = new mongoose.Schema({

		name                : {type: String},
		html                : {type: String},
		css                 : {type: String},
		script              : {type: String},
		scriptType          : {type: String, default: 'javascript'},
		json                : {type: String},
		snapshotUrl         : {type: String},
		width               : {type: Number, default: 200},
		height              : {type: Number, default: 180},
		createdAt           : {type: Date, default: Date.now},
		updatedAt           : {type: Date, default: Date.now}
	});

	app.models.WidgetTemplate = mongoose.model('WidgetTemplate', app.schemas.WidgetTemplates);

};