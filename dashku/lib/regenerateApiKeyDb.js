// Regenerates the list of API Keys in the Redis DB
//
// If you move to a new Redis DB, you will want to run
// this function to regenerate the API Key database via:
//
//    npm run regenerateApiKeyDb
//
'use strict';



// Dependencies
//
var ss		= require('socketstream');
require('../server/internals');
var User	= ss.api.app.models.User;
var Redis	= ss.api.app.Redis;



var regenerateApiKeyDb = function (cb) {

	User.find({}, function (err, users) {
		if (err === null) {
			if (users.length > 0) {
				for (var i=0;i<users.length;i++) {
					var user = users[i];
					Redis.hset('apiKeys', user.apiKey, user._id, Redis.print);
					if (users.indexOf(user) === users.length-1) {
						if (typeof cb === 'function') { cb(err); }
					}
				}
			} else {
				console.log('There are no users in the database, no need to regenerate the API key database');
				if (typeof cb === 'function') { cb(err); }
			}
		} else {
			if (typeof cb === 'function') { cb(err); }
		}
	});
};



regenerateApiKeyDb(function (err) {
	if (err) {
		console.error(err);
		process.exit(1);
	} else {
		console.log('Finished regenerating the API Key DB');
		process.exit(0);
	}
});