'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/peityLine';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'Peity Line',
	html        : fs.readFileSync(folderPath + '/main.html'),
	css         : fs.readFileSync(folderPath + '/main.css'),
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : fs.readFileSync(folderPath + '/main.json'),
	snapshotUrl : '/images/widgetTemplates/peityLine.png'
};