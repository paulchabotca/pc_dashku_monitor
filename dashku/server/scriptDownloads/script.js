// Instructions
//    npm install request
//    node dashku_WIDGETID.js
//
var request = require("request");

var data = JSONDATA;

request.post({url: "URL", body: data, json: true});