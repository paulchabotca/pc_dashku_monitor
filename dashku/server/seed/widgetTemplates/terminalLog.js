'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/terminalLog';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'Terminal Log',
	html        : fs.readFileSync(folderPath + '/main.html'),
	css         : fs.readFileSync(folderPath + '/main.css'),
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : fs.readFileSync(folderPath + '/main.json'),
	snapshotUrl : '/images/widgetTemplates/terminalLog.png'
};