'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/rainDrops';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'D3 Raindrops',
	html        : '',
	css         : fs.readFileSync(folderPath + '/main.css'),
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : '{}',
	snapshotUrl : '/images/widgetTemplates/rainDrops.png'
};