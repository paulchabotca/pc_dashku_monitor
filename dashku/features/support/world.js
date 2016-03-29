'use strict';



// Dependencies
//
var selenium              = require('selenium-launcher');
var soda                  = require('soda');
process.env.SS_ENV        = 'cucumber';
var ss                    = require('socketstream');
var config                = require('../../server/config');
require('../../app');


soda.prototype.andFinish = function (callback) {
	this.end(function (err) {
		if (err) {
			callback.fail(err);
		} else {
			callback();
		}
	});	
};


// Stub the output for now
//
ss.api.log.debug 	= function (){};
ss.api.log.info 	= function (){};


var browser = null;

var World = function (callback) {

	var shouldBeOnThePage = function (browser, callback, selector) {
		browser.chain.waitForElementPresent(selector).andFinish(callback);
	};

	if (browser === null) {
		selenium(function (err, selenium) {

			process.on('exit', function () { selenium.kill(); });

			var newBrowser = soda.createClient({
				host    : selenium.host,
				port    : selenium.port,
				url     : config[ss.env].apiHost,
				browser : 'firefox'
			});

			browser = newBrowser;

			callback({browser: browser, shouldBeOnThePage: shouldBeOnThePage});
		});
	} else {
		callback({browser:browser, shouldBeOnThePage: shouldBeOnThePage});
	}
};



exports.World = World;