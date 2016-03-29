'use strict';



// Dependencies
//
var nodemailer = require('nodemailer');

/* HELPERS */

module.exports = function (app) {



	// This fetches the user from the session
	//
	app.helpers.fetchUserFromSession = function (req, res, next) {
		app.models.User.findOne({_id: req.session.userId}, function (err, user) {
			if (err === null && user) {
				next(user);
			} else {
				res({status: 'failure', reason: err || 'User not found'});
			}
		});
	};



	// Setup the global mail transport
	app.helpers.postman = nodemailer.createTransport(app.config.mail);



};