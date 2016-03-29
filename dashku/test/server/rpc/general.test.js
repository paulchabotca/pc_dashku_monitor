'use strict';



// Dependencies
//
var assert        = require('assert');
var md            = require('markdown').markdown.toHTML;
var fs            = require('fs');
var ss            = require('socketstream');
require('../../../server/internals');



// Omit logging
//
ss.api.log.debug	= function (){};
ss.api.log.info		= function (){};



var config        = require('../../../server/config');
var User          = ss.api.app.models.User;
var ass           = ss.start();



describe('General', function () {

	describe('#getDocument', function () {



		describe('if successful', function () {



			it('should return a content object containing rendered markdown', function (done) {
				var file = 'introduction/index';
				fs.readFile(__dirname + '/../../../server/docs/' + file + '.md', 'utf8', function (err, data) {
					ass.rpc('general.getDocument', file, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].content, md(data));
						done();
					});
				});
			});



			it('should replace references to API_KEY with the user\'s api key', function (done) {
				// We assume that we are logged in as the first user
				User.findOne({}, function (err, user) {
					var file = 'api/transmit';
					ass.rpc('general.getDocument', file, function (res) {
						assert.equal(res[0].status, 'success');
						assert(res[0].content.match(user.apiKey) !== null);
						done();
					});
				});
			});



			it('should replace references to DASHKU_API_URL with the api url for Dashku', function (done) {

				// We assume that we are logged in as the first user
				User.findOne({}, function () {
					var file = 'api/transmit';
					ass.rpc('general.getDocument', file, function (res) {
						assert.equal(res[0].status, 'success');
						assert(res[0].content.match(config[ss.env].apiHost) !== null);
						done();
					});
				});
			});


		});



		describe('if not successful', function () {

			it('should return a string saying \'Error accessing document\'', function (done) {
				ass.rpc('general.getDocument', 'waa/waaa', function (res) {
					assert.equal(res[0].content, 'Document not found');
					done();
				});
			});

		});



	});



});