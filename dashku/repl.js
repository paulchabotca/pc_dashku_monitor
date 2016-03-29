'use strict';



// Dependencies
//
var repl              = require('repl');
var ss                = require('socketstream');
require('./server/internals');



ss.session.store.use('redis', ss.api.app.config.redis);



// Use redis for pubsub
ss.publish.transport.use('redis', ss.api.app.config.redis);



// Start the REPL
repl.start('> ').context.ss = ss;