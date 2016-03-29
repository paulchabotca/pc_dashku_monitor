'use strict';



var Helpers = require('./helpers');



// Enable the user to submit the new dashboard form if the user provides a name
function checkDashboardFormIsReady () {
	var button = $('#newDashboardModal button');
	if ($('#newDashboardModal input[name="name"]').val().length > 0) {
		button.removeAttr('disabled');
	} else {
		button.attr('disabled', 'disabled');
	}
}



// Render the new dashboard modal
$(document).on('click', 'a#newDashboard', function () {
	$(ss.tmpl['dashboard-newModal'].r()).modal();
});



// Bind events when the login form is visible
$(document).on('shown', '#newDashboardModal', function () {
	$(this).find('button').attr('disabled', 'disabled');
	$(this).on('hidden', function () { $(this).remove(); });
	$(this).find('input[name="name"]').keyup(checkDashboardFormIsReady);
});



// User submits the new dashboard form
$(document).on('submit', '#newDashboardModal form', function () {
	ss.rpc('dashboard.create', Helpers.serializeFormData(this), function (response) {
		if (response.status === 'success') {
			$('#newDashboardModal').modal('hide');
			Dashboard.select(response.dashboard);
		} else {
			$('#newDashboardModal input[name="name"]')
			.val('')
			.attr('placeholder', response.reason)
			.parent()
			.addClass('control-group error');
		}
	});
	// Prevents the default event on form submission
	return false;
});



// Clear the error style when the user focuses on the password field
$(document).on('focus', '#newDashboardModal input[name="name"]', function () {
	$(this).parent().removeClass('control-group error');
});



// Display the dashboard on the page
$(document).on('click', 'a.showDashboard', function () {
	Dashboard.select($(this).attr('data-id'));
});



// Record the previous value, in case the user decides not to update the field
$(document).on('focus', 'h1.name', function () {
	$(this).attr('data-previousName', $(this).text());
});



// Revert to the previous value, unless the user has pressed the enter key to submit the change
$(document).on('blur', 'h1.name', function () {
	if (!window.dontRevert) {
		$(this).text($(this).attr('data-previousName'));
	} else {
		window.dontRevert = undefined;
	}
});



// Update the dashboard with the new name
$(document).on('keypress', 'h1.name', function (event) {
	if (event.keyCode === 13) {
		window.dontRevert = true;
		$(this).blur();
		var _id = $('#widgets').attr('data-dashboardId');
		var name = $(this).text();
		ss.rpc('dashboard.update', {_id:_id,name: name});
		return false;
	}
});



// Delete dashboard confirmation dialog and response handler    
$(document).on('click', 'a#deleteDashboard', function () {
	if (confirm('Delete the dashboard?')) {
		ss.rpc('dashboard.delete', Dashboard.selected._id, function (response) {
			$('#editDashboardModal').modal('hide');
			if (response.status !== 'success') { alert(response.reason); }
		});
	}
});



// Make the dashboard fluid width
$(document).on('click', 'a#screenWidth', function () {
	var newScreenWidth = Dashboard.selected.screenWidth === 'fixed' ? 'fluid' : 'fixed';
	ss.rpc('dashboard.update', {_id: Dashboard.selected._id, screenWidth: newScreenWidth});
});



// Load the CSS editor for the dashboard
$(document).on('click', 'a#styleDashboard', function () {
	cssEditor.init(Dashboard.selected);
});



//// SS event bindings ////



// A new dashboard has been created.
// Add it to the data bucket,
// and render it in the menu items list
ss.event.on('dashboardCreated', function (dashboard) {
	Dashboard.add(dashboard);
	$('#dashboardMenuItems').prepend(ss.tmpl['dashboard-dashboardMenuItem'].render(dashboard));
	Helpers.sortDashboardMenuList('ul#dashboardMenuItems', 'li[data-dashboardid]');
});



// An existing dashboard has been updated.
// Update the data bucket,
// update the dashboards menu list item, and
// update the view rendering of that dashboard
// if it is currently selected.
ss.event.on('dashboardUpdated', function (dashboard) {
	Dashboard.update(dashboard);
	if (Dashboard.selected !== undefined && Dashboard.selected._id === dashboard._id) {
		Dashboard.selected = dashboard;
		$('.dashboard h1.name').text(dashboard.name);
		Helpers.renderCSS(dashboard.css);
		Helpers.renderScreenSize(dashboard.screenWidth);
	}
	$('#dashboardMenuItems')
	.find('li[data-dashboardId="' + dashboard._id + '"]')
	.replaceWith(ss.tmpl['dashboard-dashboardMenuItem'].render(dashboard));
	Helpers.sortDashboardMenuList('ul#dashboardMenuItems', 'li[data-dashboardid]');
});



// An existing dashboard has been deleted.
// Remove the dashboard from the data bucket, 
// remove it's item from the dashboards menu,
// and deselect it if it is currently on display.
ss.event.on('dashboardDeleted', function (dashboardId) {
	Dashboard.remove(dashboardId);
	$('#dashboardMenuItems')
	.find('li[data-dashboardId="' + dashboardId + '"]')
	.remove();
	if (Dashboard.selected._id === dashboardId) { Dashboard.select(Dashboard.all[0]); }
});