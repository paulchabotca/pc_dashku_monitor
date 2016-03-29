'use strict';
/* Widget Model */



// Dependencies
//
var mongoose = require('mongoose');
var fs       = require('fs');



// Expose the public API as a function to bind onto the app
//
module.exports = function (app) {


	var defaultHTML		= fs.readFileSync(__dirname+'/widgetDefaults/default.html');
	var defaultCSS		= fs.readFileSync(__dirname+'/widgetDefaults/default.css');
	var defaultScript	= fs.readFileSync(__dirname+'/widgetDefaults/default.js');
	var defaultJSON		= fs.readFileSync(__dirname+'/widgetDefaults/default.json');



	app.schemas.Widgets = new mongoose.Schema({
		name                : {type: String, default: 'New Widget'},
		html                : {type: String, default: defaultHTML},
		css                 : {type: String, default: defaultCSS},
		scopedCSS           : {type: String, default: ''},
		script              : {type: String, default: defaultScript},
		scriptType          : {type: String, default: 'javascript'},
		json                : {type: String, default: defaultJSON},
		userId              : {type: mongoose.Schema.ObjectId},
		width               : {type: Number, default: 200},
		height              : {type: Number, default: 180},
		widgetTemplateId    : {type: mongoose.Schema.ObjectId},
		position            : {type: Number},
		createdAt           : {type: Date, default: Date.now},
		updatedAt           : {type: Date, default: Date.now}
	});
};