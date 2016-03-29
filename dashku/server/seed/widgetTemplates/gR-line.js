'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/gr-line';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'gR Line',
	html        : '',
	css         : fs.readFileSync(folderPath + '/main.css'),
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : fs.readFileSync(folderPath + '/main.json'),
	snapshotUrl : '/images/widgetTemplates/grLine.png'
};