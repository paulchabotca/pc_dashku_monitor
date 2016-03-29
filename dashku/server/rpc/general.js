/* General RPC module */
'use strict';



// Dependencies
//
var md 		= require('markdown').markdown.toHTML;
var fs 		= require('fs');
var docData = {};



// Expose the public API
exports.actions = function (req, res, ss) {



	var fetchUserFromSession  = ss.app.helpers.fetchUserFromSession;
	var config                = ss.app.config;



	var renderDocument = function (id, data, req, res) {

		if (id.match('api/') !== null) {
			fetchUserFromSession(req, res, function (user) {
				data = data.replace(/API_KEY/g , user.apiKey);
				data = data.replace(/DASHKU_API_URL/g , config.apiHost);
				res({status: 'success', content: md(data)});
			});
		} else {
			res({status: 'success', content: md(data)});
		}
	};



	req.use('session');



	return {

		// This fetches a markdown document from the documentation, and returns the rendered html
		//
		getDocument: function (id) {

			if (docData[id]) {
				var data = docData[id];
				renderDocument(id, data, req, res);
			} else {
				fs.readFile(__dirname + '/../docs/' + id + '.md', 'utf8', function (err, data) {
					if (err === null) {
						docData[id] = data;
						renderDocument(id, data, req, res);
					} else {
						res({status: 'failure', content: 'Document not found'});
					}
				});
			}
		}


	};


};