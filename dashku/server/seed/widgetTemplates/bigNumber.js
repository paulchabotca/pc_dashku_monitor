'use strict';



// Dependencies
//
var fs          = require('fs');
var folderPath  = __dirname + '/../widgetTemplateFiles/bigNumber';



// Expose the code as the Public API
//
module.exports = {
	name          : 'Big Number',
	html          : fs.readFileSync(folderPath + '/main.html'),
	css           : fs.readFileSync(folderPath + '/main.css'),
	script        : fs.readFileSync(folderPath + '/main.js'),
	json          : fs.readFileSync(folderPath + '/main.json'),
	snapshotUrl   : '/images/widgetTemplates/bigNumber.png'
};