# Instructions
#    npm install request
#    coffee dashku_WIDGETID.coffee
#
request = require "request"

data = JSONDATA;

request.post url: "URL", body: data, json: true