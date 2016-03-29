'use strict';

// Dependencies
//
var generateTestUser = require('../lib/generateTestUser');


// uses either the TEST_USER_PATH environment variable or 
// the current working directory to store the file
//
var folderPath = process.env.TEST_USER_PATH || process.cwd();


generateTestUser(folderPath, function (err) {

    if (err) {

        console.log(err.message);
        process.exit(1);

    } else {

        console.log('File written to',folderPath + '/testUser.json');
        process.exit(0);

    }

});