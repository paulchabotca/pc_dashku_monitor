'use strict';
/* Authentication RPC module */



// Dependencies
//
var bcrypt					= require('bcryptjs');
var uuid					= require('node-uuid');
var fs						= require('fs');



var txtEmailCopy			= fs.readFileSync(__dirname + '/../emailCopy/forgottenPassword.txt', 'utf8');
var htmlEmailCopy			= fs.readFileSync(__dirname + '/../emailCopy/forgottenPassword.html', 'utf8');



var forgottenPasswordEmailText = function (link) {
	return txtEmailCopy.replace('_LINK_',link);
};



var forgottenPasswordEmailHtml = function (link) {
	return htmlEmailCopy.replace('_LINK_',link);
};



// Hashes & Salts the password
var hashPassword = function (password, cb) {
	bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(password, salt, function (err, hash) {
			cb({hash: hash, salt: salt});
		});
	});
};


// Expose the public API
//
exports.actions = function (req, res, ss) {


	var User					= ss.app.models.User;
	var Dashboard				= ss.app.models.Dashboard;
	var Redis					= ss.app.Redis;
	var config					= ss.app.config;
	var fetchUserFromSession	= ss.app.helpers.fetchUserFromSession;
	var postman					= ss.app.helpers.postman;



	req.use('session');



	return {

		// Sign up a new user
		signup: function (data) {

			var user = new User({username: data.username, email: data.email, password: data.password});
			user.save(function (err, doc) {

				if (err === null) {

					Redis.hset('apiKeys', doc.apiKey, doc._id);
					var user = {_id: doc._id, username: doc.username, email: doc.email};
					req.session.userId = doc._id;
					req.session.save(function (err) {

						if (err) {

							res({status: 'failure', reason: err});

						} else {

							var dashboard = new Dashboard({name: 'Your Dashboard', userId: user._id});
							dashboard.save(function (err) {
								if (err === null) {
									req.session.channel.subscribe('user_' + user._id);
									res({status: 'success', user: user});
								} else {
									res({status: 'failure', reason: 'Failed to create dashboard for the new user'});
								}
							});
						}
					});
				} else {
					res({status: 'failure', reason: err});
				}
			});
		},



		// Check if a user is currently signed in, based on their session
		signedIn: function () {
			fetchUserFromSession(req, res, function (user) {
				req.session.channel.subscribe('user_' + user._id);
				res({status: 'success', user: {_id: user._id, username: user.username, email: user.email, demoUser: user.demoUser}});
			});
		},



		// Login an existing user
		login: function (data) {
			User.authenticate(data, function (response) {
				if (response.status === 'success') {
					req.session.userId = response.user._id;
					req.session.save(function (err) {
						if (err) {
							res({status: 'failure', reason: err});
						} else {
							req.session.channel.subscribe('user_' + response.user._id);
							res(response);
						}
					});
				} else {
					res(response);
				}
			});
		},



		// Logout the user from the session
		logout: function () {
			req.session.userId = null;
			req.session.save(function (err) {
				if (err) {
					res({status: 'failure', reason: err});
				} else {

					// For some reason, one of the tests is causing
					// this function to blow up
					// see test/server/rpc/authentication_test.coffee
					// and #logout section for more info, also see:
					//
					// https://github.com/socketstream/socketstream/issues/299
					//
					req.session.channel.reset();
					res({status: 'success'});
				}
			});
		},



		// Check if an attribute is unique, used by the signup form
		isAttributeUnique: function (condition) {
			User.findOne(condition, function (err, user) {
				res(user === null);
			});
		},



		// Returns the account from the user session
		account: function () {
			fetchUserFromSession(req, res, function (user) {
				Redis.hget('apiUsage', user.apiKey, function (err, apiUsage) {
					if (err === null) {
						res({status: 'success', user: {_id: user._id, username: user.username, email: user.email, apiUsage: apiUsage || 0}});
					}
				});
			});
		},



		// Generates an email and a forgotten password token, when the user has forgotten their password
		forgotPassword: function (identifier) {

			var query;
			if (identifier.match('@') !== null) {
				query = {email: identifier.toLowerCase()};
			} else {
				query = {username: identifier.toLowerCase()};
			}

			User.findOne(query, function (err, user) {

				if (err === null && user) {

					user.changePasswordToken = uuid.v4();
					user.save(function (err) {
						if (err === null) {
							var link = config.forgottenPasswordUrl + user.changePasswordToken;
							res({status: 'success'});
							var mailOptions = {
								from      : 'Dashku Admin <admin@dashku.com>',
								to        : user.email,
								subject   : 'Forgotten Password',
								text      : forgottenPasswordEmailText(link),
								html      : forgottenPasswordEmailHtml(link)
							};
							postman.sendMail(mailOptions, function () {});
						} else {
							res({status: 'failure', reason: err});
						}
					});

				} else {
					var reason;
					if (err === null) {
						reason = 'User not found with identifier: ' + identifier;
					}  else {
						reason = err;
					}
					res({status: 'failure', reason: reason});
				}
			});
		},



		// Validates if the forgottenPasswordToken is valid
		loadChangePassword: function (token) {
			User.findOne({changePasswordToken: token}, function (err, doc) {
				if (err === null && doc) {
					res({status: 'success', token: doc.changePasswordToken});
				} else {
					res({status: 'failure', reason: err || 'No user found with that token'});
				}
			});
		},



		// Changes the user's password, as part of the forgotten password user flow
		changePassword: function (data) {
			User.findOne({changePasswordToken: data.token}, function (err, user) {

				if (err === null && user) {

					if (data.password === '' || data.password === undefined) {
						res({status: 'failure', reason: 'new password was not supplied'});
					} else {
						hashPassword(data.password, function (hashedPassword) {
							user.passwordHash = hashedPassword.hash;
							user.passwordSalt = hashedPassword.salt;
							user.changePasswordToken = uuid.v4();
							user.save(function (err) {
								if (err === null) {
									res({status: 'success'});
								} else {
									res({status: 'failure', reason: err});
								}
							});
						});
					}
				} else {
					res({status: 'failure', reason: err || 'No user found with that token'});
				}

			});
		},



		// Changes the user's password, from the account page
		changeAccountPassword: function (data) {
			fetchUserFromSession(req, res, function (user) {
				bcrypt.compare(data.currentPassword, user.passwordHash, function (err, authenticated) {

					if (authenticated) {

						if (data.newPassword === '' || data.newPassword === undefined) {
							res({status: 'failure', reason: 'new password was not supplied'});
						} else {
							hashPassword(data.newPassword, function (hashedPassword) {
								user.passwordHash = hashedPassword.hash;
								user.passwordSalt = hashedPassword.salt;
								user.save(function (err) {
									if (err === null) {
										res({status: 'success'});
									} else {
										res({status: 'failure', reason: err});
									}
								});
							});
						}
					} else {
						res({status: 'failure', reason: 'Current password supplied was invalid'});
					}
				});
			});
		},



		// Changes the user's email address, from the account page
		//
		changeEmail: function (data) {
			fetchUserFromSession(req, res, function (user) {
				User.find({email: data.email}, function (err, users) {
					if (err === null) {

						if (users.length === 0) {
							user.email = data.email;
							user.save(function (err) {
								if (err === null) {
									res({status: 'success'});
								} else {
									res({status: 'failure', reason: err.message});
								}
							});
						} else {
							res({status: 'failure', reason: 'Someone already has that email address.'});
						}
					} else {
						res({status: 'failure', reason: err});
					}
				});
			});
		},



		// Delete's the user's account, if they have supplied their password
		cancelAccount: function (data) {
			fetchUserFromSession(req, res, function (user) {
				bcrypt.compare(data.password, user.passwordHash, function (err, authenticated) {

					if (authenticated) {

						req.session.userId = null;
						req.session.save(function (err) {

							if (err) {
								res({status: 'failure', reason: err});
							} else {

								req.session.channel.reset();
								Dashboard.remove({userId: user._id}, function (err) {

									if (err === null) {
										User.remove({_id: user._id}, function (err) {
											if (err === null) {
												res({status: 'success'});
											} else {
												res({status: 'failure', reason: err});
											}
										});
									} else {
										res({status: 'failure', reason: err});
									}

								});
							}
						});
					} else {
						res({status: 'failure', reason: 'Password invalid'});
					}
				});
			});
		}


	};

};