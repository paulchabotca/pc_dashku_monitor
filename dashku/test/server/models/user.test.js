'use strict';



// Dependencies
//
var ss        = require('socketstream');
var assert    = require('assert');
require('../../../server/internals');



// Omit logging
//
ss.api.log.debug	= function (){};
ss.api.log.info		= function (){};



var User = ss.api.app.models.User;

describe('User', function () {

	describe('new', function () {


		before(function (done) {
			User.remove({}, done);
		});

		it('should encrypt the password', function (done) {

			var userCredentials = {
				username  : 'paulbjensen',
				email     : 'paul@anephenix.com',
				password  : '123456'
			};

			new User(userCredentials).save(function (err, doc) {
				assert.equal(doc.password, undefined);
				assert.notEqual(doc.passwordHash, undefined);
				assert.notEqual(doc.passwordSalt, undefined);
				done();
			});
		});

	});


	describe('validations', function () {


		describe('username', function () {

			beforeEach(function (done) {
				User.remove({}, function () {

					var userCredentials = {
						username  : 'paulbjensen',
						email     : 'paul@anephenix.com',
						password  : '123456'
					};

					new User(userCredentials).save(done);
				});
			});

			it('should be unique', function (done) {

				var userCredentials = {
					username  : 'paulbjensen',
					email     : 'bob@bob.com',
					password  : '123456'
				};

				new User(userCredentials).save(function (err) {
					assert.notEqual(err, null);
					User.count(function (err, count) {
						assert.equal(count, 1);
						done();
					});
				});
			});

			it('should be present', function (done) {

				var userCredentials = {
					email     : 'ren@renandstimpy.com',
					password  : '123456'
				};

				new User(userCredentials).save(function (err) {
					assert.notEqual(err, null);
					done();
				});
			});

		});

		describe('email', function () {

			beforeEach(function (done) {
				User.remove({}, function () {
					var username  = 'paulbjensen';
					var email     = 'paul@anephenix.com';
					var password  = '123456';
					var user      = new User({username: username, email: email, password: password});
					user.save(done);
				});
			});

			it('should be unique', function (done) {

				var userCredentials = {
					username  : 'paul',
					email     : 'paul@anephenix.com',
					password  : '123456'
				};

				new User(userCredentials).save(function (err) {
					assert.notEqual(err, null);
					User.count(function (err, count) {
						assert.equal(count, 1);
						done();
					});
				});

			});


			it('should be present', function (done) {

				var userCredentials = {
					username: 'ren',
					password: '123456'
				};

				new User(userCredentials).save(function (err) {
					assert.notEqual(err, null);
					done();
				});

			});

		});

		describe('password', function () {

			it('should be present', function (done) {

				var userCredentials = {
					username  : 'ren',
					email     : 'ren@renandstimpy.com'
				};

				new User(userCredentials).save(function (err) {
					assert.notEqual(err, null);
					done();
				});
			});

		});

	});



	describe('.authenticate', function () {

		before(function (done) {
			User.remove({}, function () {
				var username  = 'paulbjensen';
				var email     = 'paul@anephenix.com';
				var password  = '123456';
				var user = new User({username: username, email: email, password: password});
				user.save(done);
			});
		});

		describe('when the user exists and the password is correct', function () {

			it('should return a successful status along with the user record', function (done) {
				User.authenticate({identifier: 'paulbjensen', password: '123456'}, function (response) {

					assert(response.status === 'success');
					assert(response.user.username === 'paulbjensen');
					assert(response.user.email === 'paul@anephenix.com');
					done();

				});
			});

		});


		describe('when the user exists but the password is incorrect', function () {

			it('should return a failure status along with stating that the password is incorrect', function (done) {
				User.authenticate({identifier: 'paulbjensen', password: '1234567'}, function (response) {
					assert(response.status === 'failure');
					assert(response.reason === 'password incorrect');
					done();
				});
			});

		});

		describe('when the user does not exist', function () {

			it('should return a failure status along with stating that the user does not exist', function (done) {
				User.authenticate({identifier: 'ziggywazoo', password: 'istherelifeonmars'}, function (response) {
					assert(response.status === 'failure');
					assert(response.reason === 'the user ziggywazoo does not exist');
					done();
				});
			});

		});

	});


});