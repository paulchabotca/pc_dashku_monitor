'use strict';



// Dependencies
//
var fs                = require('fs');
var ss                = require('socketstream');
var User              = ss.api.app.models.User;
var Dashboard         = ss.api.app.models.Dashboard;
var WidgetTemplate    = ss.api.app.models.WidgetTemplate;
var widgetController  = ss.api.app.controllers.widget;



function checkDashboardAttribute (name, type, value, callback) {
	Dashboard.findOne({name: name}, function (err, dashboard) {
		if (err) {
			callback.fail(err);
		} else {
			var widget = dashboard.widgets[0];
			if (widget[type].match(value) !== null) {
				callback();
			} else {
				callback.fail('The widget\'s ' + type + ' was supposed to be ' + value + ', but is ' + widget[type]);
			}
		}
	});
}



var detectModal = function (name, cb) {
	var character = (function() {
		switch (name) {
		case 'login':
			return '#loginModal';
		case 'signup':
			return '.signupModal';
		case 'cancel account':
			return '#cancelAccountModal';
		case 'new dashboard':
			return '#newDashboardModal';
		case 'new widget':
			return '#newWidgetModal';
		case 'edit widget':
			return '#editor2';
		default:
			throw new Error('Could not find modal for ' + name);
		}
	})();

	cb(character);
};



var detectButton = function (name, cb) {
	var selector = (function() {
		switch (name) {
		case 'build widget':
			return '//div[@id="buildWidget"]';
		case 'widget from template':
			return '//div[@id="widgetFromTemplate"]';
		case 'big number':
			return '//div[@class="name" and contains(text(),\'Big Number\')]';
		case 'delete widget':
			return '//i[@class="fa fa-times-circle-o delete" and @title="delete widget"]';
		case 'edit widget':
			return '//i[@class="fa fa-cog edit" and @title="edit widget"]';
		case 'edit style':
			return '//a[@id="styleDashboard"]';
		case 'close editor':
			return '//a[@class="close"]';
		case 'test load':
			return '//li[@id="load"]';
		case 'test transmission':
			return '//li[@id="transmit"]';
		default:
			throw new Error('Could not find button for ' + name);
		}
	})();
	cb(selector);
};



module.exports = function () {



	this.World = require('../support/world').World;



	this.Before(function (callback) {
		User.remove({}, function (err) {
			Dashboard.remove({}, function (err) {
				WidgetTemplate.remove({}, callback);
			});
		});
	});



	this.Given(/^widget templates exist$/, function (callback) {
		fs.readdir(__dirname + '/../../server/seed/widgetTemplates', function (err, files) {
			if (err === null && files) {

				var handleCb = function (widgetTemplate, files, i, cb) {
					widgetTemplate.save(function (err) {
						if (err === null) {
							if (i === files.length-1) { cb(); }
						} else {
							cb.fail(err);
						}
					});
				};

				for (var i=0;i<files.length;i++) {
					var file = files[i];
					var widgetTemplate = new WidgetTemplate(require(__dirname + '/../../server/seed/widgetTemplates/' + file));
					handleCb(widgetTemplate, files, i, callback);
				}

			}
		});
	});



	this.After(function (callback) {
		this.browser.chain.testComplete().andFinish(callback);
	});



	this.Given(/^I am on the homepage$/, function (callback) {
		this.browser.chain.session().open('/').windowMaximize().setSpeed(100).andFinish(callback);
	});



	this.Given(/^I follow "([^"]*)"$/, function (link, callback) {
		var element = 'link='+link;
		this.browser.chain.waitForElementPresent(element).click(element).andFinish(callback);
	});



	this.Given(/^I fill in "([^"]*)" with "([^"]*)"$/, function (field, value, callback) {
		var element = '//input[@name="' + field + '"]';
		this.browser.chain.waitForElementPresent(element).fireEvent(element,'focus').type(element, value).fireEvent(element,'keyup').fireEvent(element,'blur').andFinish(callback);
	});



	this.Given(/^I press "([^"]*)"$/, function (button, callback) {
		var element = '//button[text()="' + button + '"]';
		this.browser.chain.waitForElementPresent(element).fireEvent(element,'focus').click(element).andFinish(callback);
	});



	// TODO - standardize on the use of either # or . for the login and signup modal css classes
	this.Given(/^the "([^"]*)" modal should appear$/, function (name, callback) {
		var self = this;
		detectModal(name, function (character) {
			self.browser.chain.waitForElementPresent('css=' + character).andFinish(callback);
		});
	});



	this.Given(/^the "([^"]*)" modal should disappear$/, function (name, callback) {
		var self = this;
		detectModal(name, function (character) {
			self.browser.chain.waitForElementNotPresent('css=' + character).andFinish(callback);
		});
	});



	this.Given(/^the "([^"]*)" modal should not disappear$/, function (name, callback) {
		var character = name === 'login' ? '#loginModal' : '.signupModal';
		this.browser.chain.waitForElementPresent('css=' + character).andFinish(callback);
	});



	this.Given(/^there should be a user with username "([^"]*)"$/, function (username, callback) {
		User.find({username: username}, function (err, docs) {
			if (err === null && docs.length === 1) {
				callback();
			} else {
				callback.fail('Expected there to be 1 user record with username ' + username + ', but found ' + docs.length);
			}
		});
	});



	this.Given(/^I should be on the dashboard page$/, function (callback) {
		this.shouldBeOnThePage(this.browser, callback, 'css=.dashboard');
	});



	this.Given(/^I should be on the home page$/, function (callback) {
		this.shouldBeOnThePage(this.browser, callback, 'css=.homepage');
	});



	this.Given(/^I should be on the account page$/, function (callback) {
		this.shouldBeOnThePage(this.browser, callback, 'css=.account');
	});



	this.Given(/^I reload the page$/, function (callback) {
		this.browser.chain.refresh().andFinish(callback);
	});



	this.Given(/^pending$/, function (callback) {
		callback.pending();
	});



	this.Given(/^a user exists with username "([^"]*)" and email "([^"]*)" and password "([^"]*)"$/, function (username, email, password, callback) {
		var user = new User({username: username, email: email, password: password});
		user.save(function (err) {
			if (err) {
				callback.fail(err);
			} else {
				callback();
			}
		});
	});



	this.Given(/^a dashboard exists with name "([^"]*)" for user "([^"]*)"$/, function (name, username, callback) {
		User.findOne({username: username}, function (err, user) {
			if (err) {
				callback.fail(err);
			} else {
				var dashboard = new Dashboard({name: name, userId: user._id});
				dashboard.save(function (err) {
					if (err) {
						callback.fail(err);
					} else {
						callback();
					}
				});
			}
		});
	});



	this.Then(/^the field "([^"]*)" should be "([^"]*)"$/, function (field, value, callback) {
		this.browser.chain.waitForValue('//input[@name="' + field + '"]', value).andFinish(callback);
	});



	this.Then(/^the field "([^"]*)" placeholder should be "([^"]*)"$/, function (field, placeholder, callback) {
		this.browser.chain.waitForAttribute('//input[@name="' + field + '"]@placeholder', placeholder).andFinish(callback);
	});



	this.Then(/^I wait for a few seconds$/, function (callback) {
		setTimeout(callback, 2000);
	});



	this.Given(/^I wait for (\d+) seconds$/, function (seconds, callback) {
		setTimeout(callback, seconds * 1000);
	});



	this.Given(/^I wait for (\d+) seconds for Travis CI$/, function (seconds, callback) {
		setTimeout(callback, seconds * 1000);
	});



	this.Then(/^there should not be a user with username "([^"]*)"$/, function (username, callback) {
		User.count({username: username}, function (err, count) {
			if (count === 0) {
				callback();
			} else {
				callback.fail('There shouldn\'t be a user with username ' + username);
			}
		});
	});



	this.Given(/^I click on the "([^"]*)" menu item$/, function (item, callback) {
		var element = '//span[contains(text(),\'' + item + '\')]';
		this.browser.chain.waitForElementPresent(element).click(element).andFinish(callback);
	});



	this.Then(/^I should see "([^"]*)"$/, function (content, callback) {
		this.browser.chain.waitForTextPresent(content).andFinish(callback);
	});



	this.Then(/^there should be an "([^"]*)" item in the Dashboards menu list$/, function (item, callback) {
		this.browser.chain.waitForElementPresent('//span[contains(text(),\'' + item + '\')]').andFinish(callback);
	});



	this.Given(/^I type "([^"]*)" into "([^"]*)"$/, function (newText, oldText, callback) {
		var element = '//h1[contains(text(),\'' + oldText + '\')]';
		this.browser.chain.focus(element).type(element, newText+'\\13').andFinish(callback);
	});



	this.Given(/^I press the Enter key$/, function (callback) {
		callback.pending();
	});



	this.Given(/^there should be a dashboard with the name "([^"]*)"$/, function (arg1, callback) {
		callback.pending();
	});



	this.Given(/^I click on the resize icon$/, function (callback) {
		var element = '//a[@id="screenWidth"]';
		this.browser.chain.waitForElementPresent(element).click(element).andFinish(callback);
	});



	this.Given(/^the dashboard should be fluid length$/, function (callback) {
		this.browser.chain.waitForElementPresent('css=.row-fluid').andFinish(callback);
	});



	this.Given(/^the dashboard should be fixed length$/, function (callback) {
		this.browser.chain.waitForElementPresent('css=.row').andFinish(callback);
	});



	this.Given(/^the dashboard with name "([^"]*)" should have a size of "([^"]*)"$/, function (name, screenWidth, callback) {
		Dashboard.findOne({name: name, screenWidth: screenWidth}, function (err, dashboard) {
			if (err) {
				callback.fail(err);
			} else {
				if (dashboard === undefined) {
					callback.fail('No dashboard found with name: ' + name + ' and screenWidth: ' + screenWidth);
				}
				else {
					callback();
				}
			}
		});
	});



	this.Then(/^I click on the delete dashboard button$/, function (callback) {
		this.browser.chain.click('//a[@id="deleteDashboard"]').andFinish(callback);
	});



	this.Then(/^I will confirm the dialog box$/, function (callback) {
		this.browser.chain.chooseOkOnNextConfirmation().andFinish(callback);
	});



	this.Then(/^I intercept the dialog$/, function (callback) {
		this.browser.chain.getConfirmation().andFinish(callback);
	});



	this.Then(/^there should not be a dashboard with the name "([^"]*)"$/, function (name, callback) {
		Dashboard.count({name: name}, function (err, count) {
			if (err || count !== 0) {
				if (err === null) { err = new Error('A Dashboard was found with name: ' + name + ', where none was expected'); }
				callback.fail(err);
			} else {
				callback();
			}
		});
	});



	this.Given(/^I click on the "([^"]*)" button$/, function (name, callback) {
		var self = this;
		detectButton(name, function (selector) {
			self.browser.chain.waitForElementPresent(selector).click(selector).andFinish(callback);
		});
	});



	this.When(/^I change the dashboard background colour to dark grey$/, function (callback) {
		this.browser.chain.focus('//textarea').type('//textarea', '\n\nbody {background:#111;}').andFinish(callback);
	});



	this.Then(/^the dashboard background should be dark grey$/, function (callback) {
		this.browser.chain.waitForElementPresent('//style[@id="dashboardStyle" and contains(text(), "body {background:#111;}")]').andFinish(callback);
	});



	this.When(/^I close the style editor$/, function (callback) {
		this.browser.chain.click('//a[@class="close"]').andFinish(callback);
	});



	this.Then(/^the dashboard with name "([^"]*)" should have css with a background of dark grey$/, function (name, callback) {
		setTimeout(function () {		
			Dashboard.find({name:name}, function (err, dashboards) {
				if (err) {
					callback.fail(err);
				} else {
					var dashboard = dashboards[0];
					if (dashboard.css.match(/body {background:#111;}/) !== null) {
						callback();
					} else {
						callback.fail('The dashboard does not have that style');
					}
				}
			});
		}, 500);
	});


	// TODO - review this step definition - I don't think that it works
	this.Then(/^I should see (\d+) widget on the page$/, function (numberOfWidgets, callback) {
		this.browser.chain.verifyElementPresent('//div[@class="widget"]').andFinish(callback);
	});



	this.Then(/^the dashboard with name "([^"]*)" should have a widget with name "([^"]*)"$/, function (name, widgetName, callback) {
		Dashboard.findOne({name: name}, function (err, dashboard) {
			if (err) {
				callback.fail(err);
			} else {
				if (dashboard.widgets[0] !== undefined && dashboard.widgets[0].name === widgetName) {
					callback();
				} else {
					callback.fail('No dashboard found with name: ' + name + ' and a widget with name: ' + widgetName);
				}
			}
		});
	});



	this.Given(/^I should see (\d+) widgets on the page$/, function (numberOfWidgets, callback) {
		this.browser.chain.verifyElementNotPresent('//div[@class="widget"]').andFinish(callback);
	});



	this.Given(/^the dashboard with name "([^"]*)" should not have any widgets$/, function (name, callback) {
		Dashboard.findOne({name: name}, function (err, dashboard) {
			if (err) {
				callback.fail(err);
			} else {
				if (dashboard.widgets.length === 0) {
					callback();
				} else {
					callback.fail('The dashboard has widgets when none were expected');
				}
			}
		});
	});



	this.Given(/^a widget exists with name "([^"]*)" for dashboard "([^"]*)"$/, function (widgetName, name, callback) {
		Dashboard.findOne({name: name}, function (err, dashboard) {
			if (err) {
				callback.fail(err);
			} else {
				User.findOne({_id: dashboard.userId}, function (err, user) {
					if (err) {
						callback.fail(err);
					} else {
						widgetController.create({dashboardId: dashboard._id, name: widgetName}, user, function (res) {
							if (res.status === 'success') {
								callback();
							} else {
								callback.fail(res.reason);
							}
						});
					}
				});
			}
		});
	});



	this.Given(/^I drag the widget resize handle (\d+) pixels right and (\d+) pixels down$/, function (pixelsRight, pixelsDown, callback) {
		this.browser.chain
			.dragAndDrop('//div[@class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se"]","+' + pixelsRight + ',+' + pixelsDown)
			.andFinish(callback);
	});



	this.Given(/^the widget for dashboard "([^"]*)" should have a width of (\d+) pixels, and a height of (\d+) pixels$/, function (name, width, height, callback) {
		Dashboard.findOne({name:name}, function (err, dashboard) {
			if (err) {
				callback.fail(err);
			} else {
				var widget = dashboard.widgets[0];
				if (widget.width === width && widget.height === height) {
					callback();
				} else {
					callback.fail('The widget\'s width and height were supposed to be ' + width + 'x' + height + ', but were ' + widget.width + 'x' + widget.height);
				}
			}
		});
	});



	this.Given(/^I click on the "([^"]*)" tab$/, function (tabName, callback) {
		this.browser.chain.click('//li[@id="' + tabName + '"]').andFinish(callback);
	});



	this.Given(/^I type "([^"]*)" into the editor$/, function (html, callback) {
		this.browser.chain.focus('//textarea').type('//textarea',html).andFinish(callback);
	});



	this.Given(/^I type some json into the editor$/, function (callback) {
		var json  = '{"version":"2"}';
		this.browser.chain.focus('//textarea').type('//textarea',json).andFinish(callback);
	});


	this.Given(/^the widget for dashboard "([^"]*)" should have the html "([^"]*)"$/, function (name, html, callback) {
		checkDashboardAttribute(name, 'html', html, callback);
	});



	this.Given(/^the widget for dashboard "([^"]*)" should have the css "([^"]*)"$/, function (name, css, callback) {
		checkDashboardAttribute(name, 'css', css, callback);
	});



	this.Given(/^the widget for dashboard "([^"]*)" should have the script "([^"]*)"$/, function (name, script, callback) {
		checkDashboardAttribute(name, 'script', script, callback);
	});



	this.Given(/^I clear the editor$/, function (callback) {
		this.browser.chain.getEval('window.editor2.editor.setValue("");').andFinish(callback);
	});



	this.Given(/^the widget for dashboard "([^"]*)" should have a JSON payload which contains that json$/, function (name, callback) {
		Dashboard.findOne({name: name}, function (err, dashboard) {
			if (err) {
				callback.fail(err);
			} else {
				var widget = dashboard.widgets[0];
				if (JSON.parse(widget.json).version === '2') {
					callback();
				} else {
					callback.fail('The widget\'s json was supposed to include version:2, but is ' + widget.json);
				}
			}
		});
	});



	// Note - this drag and drop selector is currently matching on the first content class, not by widget name
	this.Given(/^I drag "([^"]*)" (\d+) pixels to the right$/, function (element, pixelsRight, callback) {
		var self = this;
		Dashboard.findOne({}, function (err, dashboard) {

			for (var i=0;i<dashboard.widgets.length;i++) {
				var widget = dashboard.widgets[i];
				if (widget.name === element) {
					var selector = '//div[@class="content"]';
					self.browser.chain.waitForElementPresent(selector).dragAndDrop(selector,'+'+pixelsRight+',+0').andFinish(callback);
				}

			}

		});
	});



	this.Then(/^widget with name "([^"]*)" should have a position of "([^"]*)"$/, function (name, position, callback) {
		Dashboard.findOne({}, function (err, dashboard) {
			for (var i=0;i<dashboard.widgets.length;i++) {
				var widget = dashboard.widgets[i];
				if (widget.name === name) {

					if (widget.position - Number(position) === 0) {
						callback();
					} else {
						callback.fail('The widget with name ' + name + ' should have a position of ' + position + ', but has a position of ' + widget.position);
					}
				}
			}
		});
	});



	this.Given(/^the script tab should say "([^"]*)"$/, function (text, callback) {
		this.browser.chain.waitForElementPresent('//li[@id="script" and contains(text(),"' + text + '")]').andFinish(callback);
	});



	this.Given(/^I type in some coffeescript for the widget$/, function (callback) {
		// type some CoffeeScript into the editor's textarea
		var coffeescript = fs.readFileSync(__dirname + '/../../test/seed/newWidgetScript.coffee', 'utf-8');
		this.browser.chain.focus('//textarea').type('//textarea',coffeescript).andFinish(callback);
	});



	this.Then(/^The widget for dashboard "([^"]*)" should have the coffeescript as its script$/, function (name, callback) {
		var coffeescript = fs.readFileSync(__dirname + '/../../test/seed/newWidgetScript.coffee', 'utf-8');
		Dashboard.findOne({name:name}, function (err, dashboard) {
			if (dashboard.widgets[0].script === coffeescript) {
				callback();
			} else {
				callback.fail('The widget does not have the same coffeescript as expected');
			}
		});
	});



	this.Then(/^The widget for dashboard "([^"]*)" should have the script type set to "([^"]*)"$/, function (name, scriptType, callback) {
		Dashboard.findOne({name:name}, function (err, dashboard) {
			if (dashboard.widgets[0].scriptType === scriptType) {
				callback();
			} else {
				callback.fail('The widget does not have the script type set to coffee');
			}
		});
	});



	this.Given(/^I load the editor with the modified script code$/, function (callback) {
		// type some CoffeeScript into the editor's textarea
		var coffeescript = fs.readFileSync(__dirname + '/../../test/seed/modifiedWidgetScript.coffee', 'utf-8');
		this.browser.chain.focus('//textarea').type('//textarea',coffeescript).andFinish(callback);
	});



	this.Given(/^the widget on the page should contain "([^"]*)" in its html$/, function (content, callback) {
		this.browser.chain.waitForElementPresent('//div[@id=\"message\" and contains(text(),"' + content +'")]').andFinish(callback);
	});



	this.Given(/^I type some special javascript into the editor$/, function (callback) {
		var specialJavascript = fs.readFileSync(__dirname + '/../../test/seed/specialJavascript.js', 'utf-8');
		this.browser.chain.focus('//textarea').type('//textarea',specialJavascript).andFinish(callback);
	});



	this.Given(/^I type some special json into the editor$/, function (callback) {
		var json  = '{"data":"4"}';
		this.browser.chain.focus('//textarea').type('//textarea',json).andFinish(callback);
	});



	this.Given(/^the special widget on the page should contain "([^"]*)" in its html$/, function (content, callback) {
		this.browser.chain.waitForElementPresent('//div[@class="content" and contains(text(),"' + content + '")]').andFinish(callback);
	});



};