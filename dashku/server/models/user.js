'use strict';

/* User model */



// Dependencies
//
var bcrypt     = require('bcryptjs');
var uuid       = require('node-uuid');
var mongoose   = require('mongoose');



var hashPassword = function (password, cb) {
	bcrypt.genSalt(10, function (err, salt) {
		bcrypt.hash(password, salt, function (err, hash) {
			cb({hash: hash, salt:salt});
		});
	});
};



// NOTE - the password attribute exists in order
// to have a way to pass the value to the 
// encryption method. It is wiped clean by the 
// encryption method afterwards.
//
// This is a workaround for the moment, until I
// figure out a better way.
//


// Expose the public API as a function to bind onto the app
//
module.exports = function (app) {

	app.schemas.Users = new mongoose.Schema({
		username            : {type: String, lowercase: true, required: true, index: {unique: true, dropDups: false}},
		email               : {type: String, lowercase: true, required: true, index: {unique: true, dropDups: false}},
		password            : String,
		passwordHash        : String,
		passwordSalt        : String,
		createdAt           : {type: Date,   default: Date.now},
		updatedAt           : {type: Date,   default: Date.now},
		apiKey              : {type: String, default: uuid.v4},
		changePasswordToken : String
	});



	// Clean the password attribute
	app.schemas.Users.pre('save', function (next) {
		if (this.isNew) {
			if (this.password === undefined) {
				next(new Error('Password field is missing'));
			} else {
				var self = this;
				hashPassword(self.password, function (hashedPassword) {
					self.passwordHash = hashedPassword.hash;
					self.passwordSalt = hashedPassword.salt;
					self.password     = undefined;
					next();
				});
			}
		} else {
			next();
		}
	});



	app.schemas.Users.statics.authenticate = function (data, cb) {

		var query;

		if (data.identifier.match('@') !== null) {
			query = {email: data.identifier.toLowerCase()};
		} else {
			query = {username: data.identifier.toLowerCase()};
		}
		
		this.findOne({query:query}, function (err, doc) {

			if (doc) {
				bcrypt.compare(data.password, doc.passwordHash, function (err, authenticated) {

					if (authenticated) {
						// TODO - remove the reference to demoUser
						cb({status: 'success', user: {_id: doc._id, username: doc.username, email: doc.email, demoUser: doc.demoUser}});
					} else {
						cb({status: 'failure', reason: 'password incorrect'});
					}

				});
			} else {
				cb({status: 'failure', reason: 'the user ' + data.identifier + ' does not exist'});
			}
		});
	};



	app.models.User = mongoose.model('User', app.schemas.Users);



};