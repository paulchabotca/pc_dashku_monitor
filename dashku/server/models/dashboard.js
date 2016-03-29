/* Dashboard Model */
'use strict';



// Dependencies
//
var mongoose    = require('mongoose');
var defaultCss  = '/*\n\nYou can use custom CSS to style the dashboard as you like \n\nMake the changes that you like, then close the editor when you are happy.\n\nUncomment the block below to see the changes in real-time */\n\n/*\n\nbody {\n  background: #111;\n} \n\n*/';



// Expose the public API as a function to bind onto the app
//
module.exports = function (app) {

	app.schemas.Dashboards = new mongoose.Schema({
		name        : {type: String, required: true},
		createdAt   : {type: Date, default: Date.now},
		updatedAt   : {type: Date, default: Date.now},
		screenWidth : {type: String, default: 'fixed'},
		widgets     : [app.schemas.Widgets],
		userId      : {type: mongoose.Schema.ObjectId},
		css         : {type: String, default: defaultCss}
	});

	app.models.Dashboard = mongoose.model('Dashboard', app.schemas.Dashboards);

};