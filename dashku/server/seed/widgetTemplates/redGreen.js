'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/redgreen';



// Expose the widget attributes as the public API
//
module.exports = {
	name        : 'Red Green',
	html        : '',
	css         : '',
	script      : fs.readFileSync(folderPath + '/main.js'),
	json        : '{}',
	snapshotUrl : '/images/widgetTemplates/redgreen.png'
};