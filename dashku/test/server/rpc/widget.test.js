'use strict';



// Dependencies
//
var assert        = require('assert');
var Gently        = require('gently');
var ss            = require('socketstream');
require('../../../server/internals');



// Omit logging
//
ss.api.log.debug	= function (){};
ss.api.log.info		= function (){};



var User          = ss.api.app.models.User;
var Dashboard     = ss.api.app.models.Dashboard;
var ass           = ss.start();



describe('Widget', function () {
	
	describe('#create', function () {

		describe('if successful', function () {



			it('should create a widget in the dashboard', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('widget.create', {name: 'Sales Widget', dashboardId: dashboard._id}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].widget.name, 'Sales Widget');
						Dashboard.findOne({_id: dashboard._id}, function (err, dashboardReloaded) {
							assert.equal(dashboardReloaded.widgets[dashboardReloaded.widgets.length-1].name, 'Sales Widget');
							done();
						});
					});
				});
			});



			it('should scope the widget\'s css', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var css = '.content { background: blue; }';
					ass.rpc('widget.create', {name: 'Sales Widget', dashboardId: dashboard._id, css: css}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].widget.scopedCSS, '.widget[data-id=\'' + res[0].widget._id + '\'] .content { background: blue; }');
						done();
					});
				});
			});



			it('should append the widget id and the api key to the JSON', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var json = JSON.stringify({value: 76});
					ass.rpc('widget.create', {name: 'Sales Widget', dashboardId: dashboard._id, json: json}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(JSON.parse(res[0].widget.json)._id, res[0].widget._id);
						User.findOne({_id: dashboard.userId}, function (err, user) {
							assert.equal(JSON.parse(res[0].widget.json).apiKey, user.apiKey);
							done();
						});
					});
				});
			});



			it('should emit a widgetCreated event to the user\'s channel, with the dashboard id, and the widget', function (done) {
				var gently = new Gently();
				var json = JSON.stringify({value: 76});
				Dashboard.findOne({}, function (err, dashboard) {
					gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
						assert.equal(channel, 'user_' + dashboard.userId);
						assert.equal(event, 'widgetCreated');
						assert.equal(data.widget.name, 'Sales Widget');
						done();
					});
					ass.rpc('widget.create', {name: 'Sales Widget', dashboardId: dashboard._id, json: json}, function () {});
				});
			});



		});

		describe('if not successful', function () {



			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('widget.create', {name: 'Finance Widget', dashboardId: '231312312'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'dashboard with id 231312312 not found');
					done();
				});
			});



		});

	});

	describe('#update', function () {

		describe('if successful', function () {



			it('should update the widget with the new attributes', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var widget = dashboard.widgets[0];
					var newName = 'Revenue Widget';
					ass.rpc('widget.update', {dashboardId: dashboard._id, _id: widget._id, name: newName}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].widget._id, widget._id.toString());
						assert.equal(res[0].widget.name, newName);
						assert.notEqual(res[0].widget.createdAt, res[0].widget.updatedAt);
						// We're checking if the update is within a 1 second range
						assert((Date.now() - Date.parse(res[0].widget.updatedAt)) < 1000);
						done();
					});
				});
			});



			it('should append the widget id and the api key to the new JSON', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var widget = dashboard.widgets[0];
					var json = JSON.stringify({value: 79});
					ass.rpc('widget.update', {dashboardId: dashboard._id, _id: widget._id, json: json}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(JSON.parse(res[0].widget.json)._id, res[0].widget._id);
						User.findOne({_id: dashboard.userId}, function (err, user) {
							assert.equal(JSON.parse(res[0].widget.json).apiKey, user.apiKey);
							assert.equal(JSON.parse(res[0].widget.json).value, 79);
							done();
						});
					});
				});
			});



			it('should scope the widget\'s css', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var widget = dashboard.widgets[0];
					var css = '.content { background: red; }';
					ass.rpc('widget.update', {dashboardId: dashboard._id, _id: widget._id, css: css}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].widget.scopedCSS, '.widget[data-id=\'' + res[0].widget._id + '\'] .content { background: red; }');
						done();
					});
				});
			});



			it('should emit the widgetUpdated event to the user\'s channel, with the dashboard id, and the widget', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var widget = dashboard.widgets[0];
					var css = '.content { background: green; }';
					var gently = new Gently();
					gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
						assert.equal(channel, 'user_' + dashboard.userId);
						assert.equal(event, 'widgetUpdated');
						assert.equal(data.widget.css, css);
						done();
					});
					ass.rpc('widget.update', {dashboardId: dashboard._id, _id: widget._id, css: css}, function () {});
				});
			});



		});



		describe('if not successful because dashboard id is wrong', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('widget.update', {dashboardId: 'waa', _id: 'woo', name: 'Wey'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'No dashboard found with id waa');
					done();
				});
			});

		});



		describe('if not successful because widget id is wrong', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('widget.update', {dashboardId: dashboard._id, _id: 'woo', name: 'Wey'}, function (res) {
						assert.equal(res[0].status, 'failure');
						assert.equal(res[0].reason, 'No widget found with id woo');
						done();
					});
				});
			});

		});

	});

	describe('#delete', function () {

		describe('if successful', function () {



			it('should remove the widget from the dashboard, and return a success status along with the widget\'s id', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					var widget = dashboard.widgets[dashboard.widgets.length-1];
					ass.rpc('widget.delete', {dashboardId: dashboard._id, _id: widget._id}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].widgetId, widget._id.toString());
						Dashboard.findOne({_id: dashboard._id}, function (err, dashboardReloaded) {
							assert.equal(dashboardReloaded.widgets.length + 1, dashboard.widgets.length);
							done();
						});
					});
				});

			});



			it('should emit the widgetDeleted event to the user\'s channel, with the dashboard id, and the widget id', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('widget.create', {name: 'Sales Widget', dashboardId: dashboard._id}, function (res) {
						var widget = res[0].widget;
						var gently = new Gently();
						gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
							assert.equal(channel, 'user_' + dashboard.userId);
							assert.equal(event, 'widgetDeleted');
							assert.equal(data.dashboardId, dashboard._id.toString());
							assert.equal(data.widgetId, widget._id.toString());
							done();
						});
						ass.rpc('widget.delete', {dashboardId: dashboard._id, _id: widget._id}, function () {});
					});
				});
			});
		


		});

		describe('if not successful because dashboard id is wrong', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('widget.delete', {dashboardId: 'waa', _id: 'woo'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'No dashboard found with id waa');
					done();
				});
			});

		});



		describe('if not successful because widget id is wrong', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('widget.delete', {dashboardId: dashboard._id, _id: 'woo'}, function (res) {
						assert.equal(res[0].status, 'failure');
						assert.equal(res[0].reason, 'No widget found with id woo');
						done();
					});
				});
			});

		});

	});

});