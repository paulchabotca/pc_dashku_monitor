'use strict';



module.exports = function () {



	this.World = require('../support/world').World;



	this.Given(/^a user has created an account$/, function (callback) {
		callback.pending();
	});



	this.Given(/^they have logged in$/, function (callback) {
		callback.pending();
	});



	this.When(/^they click on the "([^"]*)" button$/, function (arg1, callback) {
		callback.pending();
	});



	this.Then(/^they should see the "([^"]*)" modal$/, function (arg1, callback) {
		callback.pending();
	});



	this.When(/^they fill in "([^"]*)" with "([^"]*)"$/, function (arg1, arg2, callback) {
		callback.pending();
	});



	this.When(/^they press "([^"]*)"$/, function (arg1, callback) {
		callback.pending();
	});



	this.Then(/^they should see "([^"]*)"$/, function (arg1, callback) {
		callback.pending();
	});



};