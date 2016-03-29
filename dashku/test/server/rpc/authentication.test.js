'use strict';



// TODO - once #299 on SocketStream is resolved,
// go through all of the tests, and implement
// logout as an after() cleanup where appropriate
//
// UPDATE - 299 is now resolved! :)


// Dependencies
//
var assert        = require('assert');
var Gently        = require('gently');
var uuid          = require('node-uuid');
var ss            = require('socketstream');
require('../../../server/internals');
var config        = require('../../../server/config');



// Omit logging
//
ss.api.log.debug	= function (){};
ss.api.log.info		= function (){};



var postman       = ss.api.app.helpers.postman;
var User          = ss.api.app.models.User;
var Dashboard     = ss.api.app.models.Dashboard;
var Redis         = ss.api.app.Redis;
var ass           = ss.start();



describe('Authentication', function () {



	before(function (done) {
		User.remove({}, function (err) {
			assert(err === null);
			Dashboard.remove({}, done);
		});
	});



	describe('#signup', function () {


		describe('if a valid request is made', function () {

			before(function (done) {

				var self = this;

				self.res = null;

				var newUserCredentials = {
					username  : 'paul',
					email     : 'paul@anephenix.com',
					password  : '123456'
				};


				ass.rpc('authentication.signup', newUserCredentials, function (res) {
					// For some reason, the res object called back is an array,
					// rather than the object that we get back in the browser
					//
					// See https://github.com/socketstream/socketstream/issues/278
					// for more information on this bug.
					//
					self.res = res[0];
					done();
				});

			});



			it('should create a new user record', function (done) {
				User.count({}, function (err, count) {
					assert.equal(1, count);
					done();
				});
			});



			it('should append a new hash to the apiKeys set in Redis', function (done) {
				User.findOne({_id: this.res.user._id}, function (err, user) {
					Redis.hget('apiKeys', user.apiKey, function (err,val) {
						assert.equal(val, user._id);
						done();
					});
				});
			});



			it('should generate a dashboard for the new user', function (done) {
				Dashboard.findOne({userId: this.res.user._id}, function (err, dashboard) {
					assert.equal(dashboard.name, 'Your Dashboard');
					done();
				});
			});



			it('should subscribe the user to their own private channel');
			// It would be nice if we could observe channels being
			// created via pubsub. Find out how.

			it('should return a success response', function (done) {
				assert.equal(this.res.status, 'success');
				done();
			});



		});



		describe('if the user already exists', function () {



			before(function (done) {

				var self = this;
				self.res = null;

				var newUserCredentials = {
					username  : 'paul',
					email     : 'paul@anephenix.com',
					password  : '123456'
				};

				ass.rpc('authentication.signup', newUserCredentials, function (res) {
					self.res = res[0];
					done();
				});

			});



			it('should not create another user', function (done) {
				User.count(function (err,count) {
					assert.equal(1, count);
					done();
				});
			});



			it('should return a failure response', function (done) {
				assert.equal(this.res.status, 'failure');
				done();
			});



		});



		describe('if the user is missing some credentials', function () {



			it('should return a failure response', function (done) {



				var missingUsername = {
					email     : 'earthworm@jim.com',
					password  : '123456'
				};

				var missingEmail = {
					username  : 'earthwormJim',
					password  : '123456'
				};

				var missingPassword = {
					username  : 'earthwormJim0',
					email     : 'earthworm0@jim.com'
				};

				ass.rpc('authentication.signup', missingUsername, function (res1) {

					assert.equal(res1[0].status, 'failure');

					ass.rpc('authentication.signup', missingEmail, function (res2) {

						assert.equal(res2[0].status, 'failure');

						ass.rpc('authentication.signup', missingPassword, function (res3) {

							assert.equal(res3[0].status, 'failure');
							done();

						});

					});

				});



			});



		});


	});



	describe('#signedIn', function () {



		it('should return the currently signed-in user', function (done) {

			User.findOne({username: 'paul'}, function (err, user) {
				ass.rpc('authentication.login', {identifier: 'paul', password: '123456'}, function () {
					ass.rpc('authentication.signedIn', {identifier: 'paul', password: '123456'}, function (res) {
						assert.equal(res[0].user.username, user.username);
						assert.equal(res[0].user.email, user.email);
						assert.equal(res[0].user._id, user._id.toString());
						assert.equal(res[0].status, 'success');
						done();
					});
				});
			});
		});



		it('should subscribe the user to their own private channel');



	});



	describe('#login', function () {



		describe('if successful', function () {

			it('should return a success status, and the user object', function (done) {
				User.findOne({username: 'paul'}, function (err, user) {
					ass.rpc('authentication.login', {identifier: 'paul', password: '123456'}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].user.username, user.username);
						assert.equal(res[0].user.email, user.email);
						assert.equal(res[0].user._id, user._id.toString());
						done();
					});
				});
			});

			it('should subcribe the user to their private channel');

		});



		describe('if not successful, because the password is not correct', function () {

			it('should return the failure status, and explain what went wrong', function (done) {
				ass.rpc('authentication.login', {identifier: 'paul', password: 'waaaaaaaa'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'password incorrect');
					done();
				});
			});

		});



		describe('if not successful, because the user doesn\'t exist', function () {

			it('should return the failure status, and explain what went wrong', function (done) {

				ass.rpc('authentication.login', {identifier: 'bambam', password: 'waaaaaaaa'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'the user bambam does not exist');
					done();
				});

			});

		});

	});



	// The test here is causing ss to raise an error when clearing session channels.
	describe('#logout', function () {

		//it "should remove the userId attribute from the session"

		//it "should clear all channels that the session was subscribed to"

		it('should return a success status', function (done) {
			ass.rpc('authentication.login', {identifier: 'paul', password: '123456'}, function (r) {
				assert.equal(r[0].status, 'success');
				ass.rpc('authentication.logout', function (res) {
					assert.equal(res[0].status, 'success');
					done();
				});
			});
			// TODO - figure out what should happen if you call the signedIn method
			// after you have signed out.
		});


	});


	describe('#isAttributeUnique', function () {



		it('should return true if the query finds a document that matches the criteria', function (done) {
			ass.rpc('authentication.isAttributeUnique', {username: 'waa'}, function (res) {
				assert.equal(res[0], true);
				done();
			});
		});



		it('should return false if the query does not find a document that matches the criteria', function (done) {
			ass.rpc('authentication.isAttributeUnique', {username: 'paul'}, function (res) {
				assert.equal(res[0], false);
				done();
			});
		});

	});



	describe('#account', function () {

		it('should return the user object based on the user\'s session, including their api usage', function (done) {
			User.findOne({username: 'paul'}, function (err, user) {
				ass.rpc('authentication.login', {identifier: 'paul', password: '123456'}, function () {
					ass.rpc('authentication.account', function (res) {
						assert.equal(res[0].user._id, user._id.toString());
						assert.equal(res[0].user.username, user.username);
						assert.equal(res[0].user.email, user.email);
						assert.equal(res[0].user.apiUsage, 0);
						assert.equal(res[0].status, 'success');
						done();
					});
				});
			});
		});

	});



	describe('#forgotPassword', function () {



		describe('if a user is found', function () {



			it('should generate a change password token for the user', function (done) {
				var identifier = 'paul';
				User.findOne({username: identifier}, function (err, user) {
					assert.equal(user.changePasswordToken, undefined);
					ass.rpc('authentication.forgotPassword', identifier, function (res) {
						assert.equal(res[0].status, 'success');
						User.findOne({username: identifier}, function (err, userReloaded) {
							assert.notEqual(userReloaded.changePasswordToken, undefined);
							done();
						});
					});
				});
			});



			it('should send an email to the user with a link to follow to change their password', function (done) {
				var gently      = new Gently();
				var identifier  = 'paul';
				gently.expect(postman, 'sendMail', function (sm) {
					var fpToken = sm.text.split('fptoken=')[1].split(/\n/)[0];
					assert.equal(sm.from, 'Dashku Admin <admin@dashku.com>');
					assert.equal(sm.to, 'paul@anephenix.com');
					assert.equal(sm.subject, 'Forgotten Password');
					assert.equal(sm.text, 'Hi,\n\nWe got a notification that you\'ve forgotten your password. It\'s cool, we\'ll help you out.\n\nIf you wish to change your password, follow this link: ' + config[ss.env].apiHost + '?fptoken=' + fpToken + '\n\nRegards,\n\n  Dashku Admin');
					assert.equal(sm.html, '<p>Hi,</p>\n<p>We got a notification that you\'ve forgotten your password. It\'s cool, we\'ll help you out.</p>\n<p>If you wish to change your password, follow this link: <a>' + config[ss.env].apiHost + '?fptoken=' + fpToken + '</a></p>\n<p>Regards,</p>\n<p>  Dashku Admin</p>');
					done();
				});
				ass.rpc('authentication.forgotPassword', identifier, function () {});
			});



		});

		describe('if a user is not found', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				var identifier = 'theVanBowserBomb';
				ass.rpc('authentication.forgotPassword', identifier, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'User not found with identifier: ' + identifier);
					done();
				});

			});

		});

	});


	describe('#loadChangePassword', function () {



		describe('if the token is valid', function () {

			it('should return a success status', function (done) {
				var newToken = uuid.v4();
				User.findOne({username: 'paul'}, function (err, user) {
					user.changePasswordToken = newToken;
					user.save(function (err) {
						assert(err === null);
						ass.rpc('authentication.loadChangePassword', newToken, function (res) {
							assert.equal(res[0].status, 'success');
							done();
						});
					});
				});
			});

		});



		describe('if the token is not valid', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('authentication.loadChangePassword', 'waa', function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'No user found with that token');
					done();
				});
			});

		});

	});



	describe('#changePassword', function () {

		describe('if the user\'s token is valid', function () {

			describe('if a password is provided', function () {

				it('should change the user\'s password to the password provided, change the token, and return a success status', function (done) {

					var newToken = uuid.v4();
					User.findOne({username: 'paul'}, function (err, user) {
						user.changePasswordToken = newToken;
						user.save(function (err) {
							assert(err === null);
							ass.rpc('authentication.changePassword', {token: newToken, password: 'poiuyt'}, function (res) {
								assert.equal(res[0].status, 'success');
								ass.rpc('authentication.login', {identifier: 'paul', password: 'poiuyt'}, function (res) {
									assert.equal(res[0].status, 'success');
									User.findOne({username: 'paul'}, function (err, user) {
										assert.notEqual(user.changePasswordToken, newToken);
										done();
									});
								});
							});
						});
					});

				});

			});



			describe('if a password is not provided', function () {

				it('should return a failure status and explain what went wrong', function (done) {
					var newToken = uuid.v4();
					User.findOne({username: 'paul'}, function (err, user) {
						user.changePasswordToken = newToken;
						user.save(function (err) {
							assert(err === null);
							ass.rpc('authentication.changePassword', {token: newToken}, function (res) {
								assert.equal(res[0].status, 'failure');
								assert.equal(res[0].reason, 'new password was not supplied');
								done();
							});
						});

					});
				});


			});


		});

		describe('if the user\'s token is not valid', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('authentication.changePassword', {token: 'waa'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'No user found with that token');
					done();
				});
			});


		});
	});

	describe('#changeAccountPassword', function () {



		describe('if the user\'s password matches', function () {



			describe('if a new password is provided', function () {

				it('should change the user\'s password to the password provided', function (done) {

					// We're already logged in as username: paul
					ass.rpc('authentication.changeAccountPassword', {currentPassword: 'poiuyt', newPassword: 'qwerty'}, function (res) {
						assert.equal(res[0].status, 'success');
						ass.rpc('authentication.login', {identifier: 'paul', password: 'qwerty'}, function (res) {
							assert.equal(res[0].status, 'success');
							done();
						});
					});
				});

			});



			describe('if a new password is not provided', function () {

				it('should return a failure status and explain what went wrong', function (done) {
					ass.rpc('authentication.changeAccountPassword', {currentPassword: 'qwerty'}, function (res) {
						assert.equal(res[0].status, 'failure');
						assert.equal(res[0].reason, 'new password was not supplied');
						done();
					});
				});

			});



		});



		describe('if the user\'s password does not match', function () {



			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('authentication.changeAccountPassword', {currentPassword: 'cheeseWin', newPassword: 'qwerty'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'Current password supplied was invalid');
					done();
				});
			});



		});

	});



	describe('#changeEmail', function () {



		describe('if an email address is provided', function () {



			describe('if the email address is unique', function () {



				it('should change the user\'s email address, and return a success status', function (done) {
					User.findOne({username: 'paul'}, function (err, user) {
						ass.rpc('authentication.login', {identifier: 'paul@anephenix.com', password: 'qwerty'}, function (res) {
							assert.equal(res[0].status, 'success');
							ass.rpc('authentication.changeEmail', {email: 'paulbjensen@gmail.com'}, function (res) {
								User.findOne({_id: user._id}, function (err, userReloaded) {
									assert.equal(res[0].status, 'success');
									assert.equal(userReloaded.email, 'paulbjensen@gmail.com');
									done();
								});
							});
						});
					});
				});



			});



			describe('if the email address is not unique', function () {

				it('should return a failure status and explain what went wrong', function (done) {
					new User({username: 'johny_bravo', email: 'johny@bravo.com', password: '123456'}).save(function () {
						ass.rpc('authentication.login', {identifier: 'paulbjensen@gmail.com', password: 'qwerty'}, function (res) {
							assert.equal(res[0].status, 'success');
							ass.rpc('authentication.changeEmail', {email: 'johny@bravo.com'}, function (res) {
								assert.equal(res[0].status, 'failure');
								assert.equal(res[0].reason, 'Someone already has that email address.');
								done();
							});
						});
					});
				});

			});

		});



		describe('if an email address is not provided', function () {



			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('authentication.login', {identifier: 'paulbjensen@gmail.com', password: 'qwerty'}, function (res) {
					assert.equal(res[0].status, 'success');
					ass.rpc('authentication.changeEmail', {email: null}, function (res) {
						assert.equal(res[0].status, 'failure');
						assert.equal(res[0].reason, 'User validation failed');
						done();
					});
				});
			});



		});



	});



});