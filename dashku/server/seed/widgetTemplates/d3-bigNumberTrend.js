'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/d3-bigNumberTrend';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'D3 Trend',
	html        : '',
	css         : fs.readFileSync(folderPath + '/main.css'),
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : fs.readFileSync(folderPath + '/main.json'),
	snapshotUrl : '/images/widgetTemplates/d3-bigNumberTrend.png'
};