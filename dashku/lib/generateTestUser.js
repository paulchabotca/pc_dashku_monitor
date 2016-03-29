'use strict';

/* This is a script used to generate a test user for testing client APIs
	 such as Dashku's Node API wrapper. */



// Dependencies
//
var	fs		= require('fs');
var	path	= require('path');
var	ss		= require('socketstream');
require('../server/internals');



// Used to generate the testUser details file
//
// @param		folderPath		String		This folder path to generate the testUser.json file in
// @param		user			Object		The user record
// @param		cb				Function	The function to execute once finished
//
function generateFile (folderPath, user, cb) {
	var	payload		= {username: user.username, apiKey: user.apiKey};
	var	filePath	= path.join(folderPath, 'testUser.json');
	fs.writeFile(filePath, JSON.stringify(payload), cb);
}



// Used to generate a test user, as well as a JSON file containing their 
//username and API Key 
//
// @param   folderPath    String    The folder path to generate the testUser.json file in
// @param   cb            Function  The function to execute once finished
//
function generateTestUser (folderPath, cb) {

	ss.api.app.models.User.findOne({username: 'test-user'}, function (err, user) {

		if (err) { return cb(err); }

		if (user) {

			generateFile(folderPath, user, cb);

		} else {

			new ss.api.app.models.User({username: 'test-user', email: 'test@anephenix.com', password: '123456'})
			.save(function (err, user) {

				if (err) { return cb(err); }

				generateFile(folderPath, user, cb);

			});

		}

	});

}



// Export the function as the public API
//
module.exports = generateTestUser;