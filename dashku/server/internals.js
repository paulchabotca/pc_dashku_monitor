// Internals, where all the config is loaded and set into the application
'use strict';



// Dependencies
//
var ss = require('socketstream');



// Generate the app object to store the models, controllers and helpers
//
var app = {
	models      : {},
	controllers : {},
	schemas     : {},
	helpers     : {}
};



app.config = require('./config')[ss.env];



require('./db')(app);
require('./helpers')(app);
require('./controllers/dashboard')(app);
require('./controllers/widget')(app);



// Append the app object to SocketStream
//
ss.api.add('app', app);