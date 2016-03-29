'use strict';



// Dependencies
//
var assert        = require('assert');
var Gently        = require('gently');
var ss            = require('socketstream');
require('../../../server/internals');
var User          = ss.api.app.models.User;
var Dashboard     = ss.api.app.models.Dashboard;



// Omit logging
//
ss.api.log.debug	= function (){};
ss.api.log.info		= function (){};



var ass           = ss.start();


describe('Dashboard', function () {



	describe('#create', function () {



		describe('if the name and userId is present', function () {



			it('should create the dashboard, and return a success status along with the dashboard', function (done) {
				// Assume that we are already logged in from authentication.coffee
				ass.rpc('dashboard.create', {name: 'Nice dashboard'}, function (res) {
					assert.equal(res[0].status, 'success');
					assert.equal(res[0].dashboard.name, 'Nice dashboard');
					done();
				});
			});



			it('should emit a dashboardCreated event with the dashboard', function (done) {
				var gently = new Gently();
				User.findOne({}, function (err, user) {
					assert(err === null);
					gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
						assert.equal(channel, 'user_' + user._id);
						assert.equal(event, 'dashboardCreated');
						assert.equal(data.name, 'Yet another dashboard');
						done();
					});
					ass.rpc('dashboard.create', {name: 'Yet another dashboard'}, function (res) {
						assert.equal(res[0].status, 'success');
						ass.rpc('dashboard.delete', res[0].dashboard._id, function () {});
					});
				});
			});



		});



		describe('if the name is not present', function () {

			it('should return a failure status, and explain what went wrong', function (done) {
				ass.rpc('dashboard.create', {}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'Dashboard validation failed');
					done();
				});
			});

		});



	});



	describe('#getAll', function () {



		it('should return a success status & the user\'s dashboards', function (done) {
			ass.rpc('dashboard.getAll', function (res) {
				assert.equal(res[0].status, 'success');
				assert.notEqual(res[0].dashboards, undefined);
				assert.equal(res[0].dashboards[0].name, 'Nice dashboard');
				assert.equal(res[0].dashboards[res[0].dashboards.length-1].name, 'Your Dashboard');
				done();
			});
		});



	});



	describe('#externalGet', function () {

		describe('if dashboard is found', function () {

			it('should subscribe the user to their own private channel');
			// TODO - find a way to observe channel creation

			it('should return a success status and the dashboard', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('dashboard.externalGet', dashboard._id, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].dashboard.name, dashboard.name);
						assert.equal(res[0].dashboard._id, dashboard._id.toString());
						done();
					});
				});
			});



		});



		describe('if dashboard is not found', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('dashboard.externalGet', '00001', function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'Dashboard not found');
					done();
				});
			});

		});



	});



	describe('#update', function () {


		describe('if successful', function () {



			it('should update the dashboard', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('dashboard.update', {_id: dashboard._id, name: 'CheeseWin'}, function (res) {
						assert.equal(res[0].status, 'success');
						assert.equal(res[0].dashboard.name, 'CheeseWin');
						Dashboard.findOne({_id: dashboard._id}, function (err, dashboardReloaded) {
							assert.equal(dashboardReloaded.name, 'CheeseWin');
							done();
						});
					});
				});
			});




			it('should emit a dashboardUpdated event to the user\'s channel, with the updated dashboard', function (done) {
				var gently = new Gently();
				User.findOne({}, function (err, user) {
					Dashboard.findOne({}, function (err, dashboard) {
						gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
							assert.equal(channel, 'user_' + user._id);
							assert.equal(event, 'dashboardUpdated');
							assert.equal(data.name, 'CheeseWin 2.0');
							done();
						});

						ass.rpc('dashboard.update', {_id: dashboard._id, name: 'CheeseWin 2.0'}, function () {});
					});
				});
			});



		});



		describe('if not successful, because the dashboard id does not exist', function () {



			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('dashboard.update', {_id: '000111', name: 'Bonobo'}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'Dashboard not found');
					done();
				});
			});



		});



	});



	describe('#delete', function () {


		describe('if successful', function () {



			it('should delete the dashboard, and return a success status along with the deleted dashboard\'s id', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('dashboard.delete', dashboard._id, function (res) {
						assert.equal('success', res[0].status);
						assert.equal(dashboard._id.toString(), res[0].dashboardId);
						Dashboard.findOne({_id: dashboard._id}, function (err, dashboardReloaded) {
							assert.equal(dashboardReloaded, null);
							done();
						});
					});
				});
			});



			it('should emit a dashboardDeleted event to the user\'s channel, with the id of the deleted dashboard', function (done) {
				var gently = new Gently();
				User.findOne({}, function (err, user) {
					new Dashboard({userId: user._id, name: 'Boom'}).save(function (err, dashboard) {
						gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
							assert.equal(channel, 'user_' + user._id);
							assert.equal('dashboardDeleted', event);
							assert.equal(data, dashboard._id.toString());
							done();
						});
						ass.rpc('dashboard.delete', dashboard._id, function () {});
					});
				});
			});



		});



		describe('if not successful because only one dashboard remains', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				Dashboard.findOne({}, function (err, dashboard) {
					ass.rpc('dashboard.delete', dashboard._id, function (res) {
						assert.equal('failure', res[0].status);
						assert.equal('You can\'t delete your last dashboard', res[0].reason);
						done();
					});
				});
			});

		});

		describe('if not successful because dashboard id does not exist', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('dashboard.create', {name: 'YA Dashboard'}, function () {
					ass.rpc('dashboard.delete', '00001', function (res) {
						assert.equal(res[0].status, 'failure');
						assert.equal(res[0].reason, 'Dashboard not found');
						done();
					});
				});
			});
		});

	});



	describe('#updateWidgetPositions', function () {



		describe('if successful', function () {

			it('should set the widget\'s position to the new value', function (done) {
				ass.rpc('dashboard.create', {name: 'Sales Dashboard'}, function (res) {

					var dashboard = res[0].dashboard;
					ass.rpc('widget.create', {dashboardId: dashboard._id, name: 'Widget 1'}, function (res) {
						var widget1 = res[0].widget;
						ass.rpc('widget.create', {dashboardId: dashboard._id, name: 'Widget 2'}, function (res) {

							var widget2 = res[0].widget;
							ass.rpc('widget.create', {dashboardId: dashboard._id, name: 'Widget 3'}, function (res) {

								var widget3 = res[0].widget;
								var positions = {};
								positions[widget1._id] = 1;
								positions[widget2._id] = 2;
								positions[widget3._id] = 0;
								ass.rpc('dashboard.updateWidgetPositions', {_id: dashboard._id, positions: positions}, function (res) {
									assert.equal(res[0].status, 'success');
									Dashboard.findOne({_id: dashboard._id}, function (err, dashboardReloaded) {
										assert.equal(dashboardReloaded.widgets[0].position, 1);
										assert.equal(dashboardReloaded.widgets[1].position, 2);
										assert.equal(dashboardReloaded.widgets[2].position, 0);
										done();
									});
								});
							});
						});
					});
				});
			});

			it('should emit a widgetPositionsUpdated event to the user\'s channel, with the positions data', function (done) {
				var gently = new Gently();
				Dashboard.findOne({name: 'Sales Dashboard'}, function (err, dashboard) {
					var positions = {};
					positions[dashboard.widgets[0]._id] = 0;
					positions[dashboard.widgets[1]._id] = 1;
					positions[dashboard.widgets[2]._id] = 2;
					gently.expect(ss.api.publish, 'channel', function (channel, event, data) {
						assert.equal(channel, 'user_' + dashboard.userId);
						assert.equal(event, 'widgetPositionsUpdated');
						assert.equal(data._id, dashboard._id.toString());
						assert.equal(data.positions[dashboard.widgets[0]._id], 0);
						assert.equal(data.positions[dashboard.widgets[1]._id], 1);
						assert.equal(data.positions[dashboard.widgets[2]._id], 2);
						done();
					});
					ass.rpc('dashboard.updateWidgetPositions', {_id: dashboard._id, positions: positions}, function () {});
				});

			});



		});



		describe('if not successful, because the dashboard does not exist', function () {

			it('should return a failure status and explain what went wrong', function (done) {
				ass.rpc('dashboard.updateWidgetPositions', {_id: '00001111', positions: {}}, function (res) {
					assert.equal(res[0].status, 'failure');
					assert.equal(res[0].reason, 'Dashboard not found');
					done();
				});
			});

		});


	});



});