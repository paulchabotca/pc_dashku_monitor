'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/nvd3-bar';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'NVD3 bar',
	html        : '',
	css         : fs.readFileSync(folderPath + '/main.css'),
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : fs.readFileSync(folderPath + '/main.json'),
	snapshotUrl : '/images/widgetTemplates/nvd3Bar.png'
};