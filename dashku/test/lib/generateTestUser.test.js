'use strict';
// Used to test the lib/generateTestUser.js file

// Dependencies
var assert            = require('assert'),
    fs                = require('fs'),
    generateTestUser  = require('../../lib/generateTestUser'),
    ss                = require('socketstream');
require('../../server/internals');



describe('generateTestUser()', function () {

    var pathForTest       = '/tmp';
    var expectedFilePath  = pathForTest + '/testUser.json';

    beforeEach(function (done) {

        fs.exists(expectedFilePath, function (exists) {

            if (!exists) { return done(); }

            fs.unlink(expectedFilePath, done);

        });


    });

    describe('when a test user does not exist', function () {

        before(function (done) {
            ss.api.app.models.User.remove({username: 'test-user'}, done);
        });

        it('should create a test user and then generate a json file at the given file path, containing the details of the test user', function (done) {

            generateTestUser(pathForTest, function (err) {

                assert.equal(null, err);

                fs.readFile(expectedFilePath, function (err, data) {

                    assert.equal(null, err);
                    var testUser = JSON.parse(data);
                    ss.api.app.models.User.findOne({username: testUser.username}, function (err, user) {

                        assert.equal(user.apiKey, testUser.apiKey);
                        done(err);

                    });

                });

            });


        });

    });



    describe('when a test user exists', function () {

        it('should generate a json file at the given file path, containing the details of the test user', function (done) {

            ss.api.app.models.User.findOne({username: 'test-user'}, function (err, user) {

                assert.equal(null, err);
                assert.equal(user.username, 'test-user');
                generateTestUser(pathForTest, function (err) {

                    assert.equal(null, err);
                    fs.readFile(expectedFilePath, function (err, data) {

                        assert.equal(null, err);
                        var testUser = JSON.parse(data);

                        assert.equal(testUser.username, user.username);
                        assert.equal(testUser.apiKey, user.apiKey);
                        done(err);

                    });

                });

            });

        });

    });

});