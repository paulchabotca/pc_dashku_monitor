'use strict';



// The Widget controller ####



// Dependencies
//
var _  			= require('underscore');
var ss 			= require('socketstream');
var scopeCSS 	= require('../../client/code/app/shared').scopeCSS;



// A man who moves a mountain, starts by moving small stones - Chinese Proverb
//
module.exports = function (app) {

	var WidgetTemplate  = app.models.WidgetTemplate;
	var Dashboard       = app.models.Dashboard;

	var createAWidgetDry = function (dashboard, data, user, cb) {
		dashboard.widgets.push(_.extend(data, {userId: user._id, dashboardId: undefined}));
		dashboard.save(function (err, doc) {

			if (err === null) {

				var widget        = _.last(doc.widgets);
				var id            = widget._id;
				// Scope the CSS so that it applies to the contents of that particular widget
				widget.scopedCSS  = scopeCSS(widget.css, id);
				var json          = JSON.parse(widget.json);
				json._id          = id;
				json.apiKey       = user.apiKey;
				widget.json       = JSON.stringify(json, null, 2);
				dashboard.save(function (err) {
					if (err === null) {
						var widget = dashboard.widgets.id(id);
						ss.api.publish.channel('user_' + user._id, 'widgetCreated', {dashboardId: dashboard._id, widget: widget});
						cb({status: 'success', widget: widget});
					} else {
						cb({status: 'failure', reason: err});
					}
				});
			} else {
				cb({status: 'failure', reason: err});
			}
		});
	};



	app.controllers.widget = {



		create: function (data, user, cb) {
			Dashboard.findOne({_id: data.dashboardId}, function (err, dashboard) {
				if (err === null && dashboard !== undefined) {

					if (data.widgetTemplateId) {
						WidgetTemplate.findOne({_id: data.widgetTemplateId}, function (err, widgetTemplate) {

							if (err === null && widgetTemplate !== undefined) {

								var items = ['name', 'html', 'css', 'script', 'scriptType', 'json','width', 'height'];

								for (var i=0;i<items.length;i++) {
									var element = items[i];
									data[element] = widgetTemplate[element];
									if (items.indexOf(element) === items.length-1) {
										createAWidgetDry(dashboard,data, user, cb);
									}
								}

							} else {
								cb({status: 'failure', reason: 'Widget Template not found'});
							}

						});
					} else {
						createAWidgetDry(dashboard, data, user, cb);
					}
				} else {
					var reason = dashboard === undefined ? 'dashboard with id ' + data.dashboardId + ' not found' : err;
					cb({status: 'failure', reason: reason});
				}
			});
		},



		update: function (data, cb) {
			Dashboard.findOne({_id: data.dashboardId}, function (err, dashboard) {

				if (err === null && dashboard !== undefined) {

					var widget = dashboard.widgets.id(data._id);

					if (widget !== null) {

						var oldJSON = JSON.parse(widget.json);

						// TODO - this one
						// widget[key] = value for key,value of data
						var key, value;

						for (key in data) {
							value = data[key];
							widget[key] = value;
						}

						widget.scopedCSS  = scopeCSS(widget.css, widget._id);

						try {
							var newJSON           = JSON.parse(widget.json);
							newJSON._id       = oldJSON._id;
							newJSON.apiKey    = oldJSON.apiKey;
							widget.json = JSON.stringify(newJSON, null, 2);
						} catch (error) {
							widget.json = JSON.stringify(oldJSON, null, 2);
						}
						widget.updatedAt = Date.now();

						dashboard.save(function (err) {

							if (err === null) {

								widget = dashboard.widgets.id(data._id);
								ss.api.publish.channel('user_'+ dashboard.userId, 'widgetUpdated', {dashboardId: dashboard._id, widget: widget});
								cb({status: 'success', widget: dashboard.widgets.id(data._id)});

							} else {

								cb({status: 'failure', reason: err});

							}

						});

					} else {
						cb({status: 'failure', reason: 'No widget found with id ' + data._id});
					}
				} else {
					cb({status: 'failure', reason: 'No dashboard found with id ' + data.dashboardId});
				}
			});
		},



		delete: function (data, cb) {
			Dashboard.findOne({_id: data.dashboardId}, function (err, dashboard) {

				if (err === null && dashboard !== undefined) {

					var widget = dashboard.widgets.id(data._id);
					if (widget !== null) {

						widget.remove();
						dashboard.save(function (err) {

							if (err === null) {
								ss.api.publish.channel('user_' + dashboard.userId, 'widgetDeleted', {dashboardId: dashboard._id, widgetId: data._id});
								cb({status: 'success', widgetId: data._id});
							} else {
								cb({status: 'failure', reason: err});
							}

						});
					} else {
						cb({status: 'failure', reason: 'No widget found with id ' + data._id});
					}
				} else {
					cb({status: 'failure', reason: 'No dashboard found with id ' + data.dashboardId});
				}
			});
		}



	};



};