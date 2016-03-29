'use strict';



// Dependencies
//
var StateManager = require('./stateManager');
var Helpers      = require('./helpers');



// Widgets //

// The state manager for the new widget modal
var newWidgetState = new StateManager('#step');
newWidgetState.addState('choose', function () { $('#step').html(ss.tmpl['widget-choose'].r()); });
newWidgetState.addState('templates', function () {
    $('#step').html(ss.tmpl['widget-templates'].render({widgetTemplates: WidgetTemplate.all}));
});
  


// Load the step1 template when the new widget modal is visible
$(document).on('shown', '#newWidgetModal', function () {
    newWidgetState.setState('choose');
});



// Show the new widget modal
$(document).on('click', 'a#newWidget', function (event) {
    $(ss.tmpl['widget-newModal'].r()).modal();
});


  
// Remove the new widget modal from the DOM once hidden
$(document).on('hidden', '#newWidgetModal', function () {
    $(this).remove();
});



// Adds a new widget to the dashboard
$(document).on('click', '.option#buildWidget', function (event) {
    $('#newWidgetModal').modal('hide');
    ss.rpc('widget.create', {dashboardId: Dashboard.selected._id}, function (response) {
        if (response.status === 'success') {
            // do nothing
        } else {
            // do nothing
        }
    });
});



// Display the widgetTemplates list in the new widget modal
$(document).on('click ', '.option#widgetFromTemplate', function (event) {
    newWidgetState.setState('templates');
});



// Bind the "go back" button to display the choose state in the new widget modal
$(document).on('click', 'a#goBack', function (event) {
    newWidgetState.setState('choose');
});



// Bind the click on a widget template to create a widget from the template
$(document).on('click', '.widgetTemplate', function (event) {
    ss.rpc('widget.create', {dashboardId: Dashboard.selected._id, widgetTemplateId: $(this).attr('data-id')}, function (response) {
        if (response.status === 'success') {
            $('#newWidgetModal').modal('hide');
        } else {
            alert('There was an error - ' + response.reason);
        }
    });
});



// Bind the Return key on the widget name to update the name on the widget
$(document).on('keypress', '.widget .header', function (event) {
    if (event.keyCode === 13) {
        window.dontRevert = true;
        $(this).blur();
        ss.rpc(
            'widget.update',
            {dashboardId: Dashboard.selected._id, _id: $(this).parent().attr('data-id'), name: $(this).text()},
            function (response) {
                if (response.status === 'success') {
                    // Nothing to do, the name is already updated
                } else {
                    // TODO - figure out a nice, generic way to handle these errors
                    alert('There was an error - ' + response.reason);
                }
            }
        );
    }
});



// Record the previous value, in case the user decides not to update the field
$(document).on('focus', '.widget .header', function () {
    $(this).attr('data-previousName', $(this).text());
});



// Revert to the previous value, unless the user has pressed the enter key to submit the change
$(document).on('blur', '.widget .header', function () {
    if (!window.dontRevert) {
        $(this).text($(this).attr('data-previousName'));
    } else {
        window.dontRevert = undefined;
    }
});



// Edit the widget
$(document).on('click', '.widget .edit', function () {
    var widget = $(this).parent().parent();
    widget.addClass('editMode');
    Widget.select(widget.attr('data-id'));
    $('body').append($('<div id="overlay"></div>').hide().fadeIn(500));
    editor2.init(Dashboard.selected._id, Widget.selected, function () {
        Widget.selected = null;
        $('#overlay').fadeOut(250, function () {
            $('#overlay').remove();
            widget.removeClass('editMode');
        });
    });
});



// Delete the widget
$(document).on('click', '.widget .delete', function () {
    var id = $(this).parent().parent().attr('data-id');
    if (confirm('Are you sure you want to delete the widget?')) {
        ss.rpc('widget.delete', {_id: id, dashboardId: Dashboard.selected._id});
    }
});



//// Events ////



// Bind on a new widget being created
ss.event.on('widgetCreated', function (data) {
    var index = Dashboard.all.indexOf(Dashboard.find(data.dashboardId));
    Dashboard.all[index].widgets.push(data.widget);
    if (Dashboard.selected._id === data.dashboardId) {
        Widget.add(data.widget, function () {
            $('#widgets').append(ss.tmpl['dashboard-widget'].render(data.widget));
            var widget = Widget.find(data.widget._id);
            widget.eventEmitter = new EE({code: widget.script, id: widget._id, scriptType: widget.scriptType});
            Helpers.makeWidgetsResizeable($('.widget[data-id="' + widget._id + '"]'));
        });
    }
});



// A helper function to detect if only the name changed on the widget.
// This is so that we don't perform unnecessary re-rendering of the
// widget.
//
// TODO - check if this belongs in a better location
window.onlyNameChanged = function (currentWidget, newWidget) {
    var changedValues = [];

    var key, value;

    for (key in currentWidget) {
        value = currentWidget[key];
        if (currentWidget[key] !== newWidget[key] && ['updatedAt', 'eventEmitter'].indexOf(key) === -1) {
            changedValues.push(key);
        }
    }
    return changedValues.length === 1 && changedValues[0] === 'name';
};



// Bind on when a widget is updated. A lot of things happen here.
ss.event.on('widgetUpdated', function (data) {

    var item, widgetObject, _i, _len, _ref;

    // Select the widget model object in the data Bucket
    var dashboardIndex  = Dashboard.all.indexOf(Dashboard.find(data.dashboardId));
    var widgetIndex     = Dashboard.all[dashboardIndex].widgets.indexOf(widgetObject);

    _ref = Dashboard.all[dashboardIndex].widgets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item._id === data.widget._id) {
            widgetObject = item;
        }
    }

    // Check if only the name was updated
    if (onlyNameChanged(widgetObject, data.widget)) {
        // Just update the widget's name
        Dashboard.all[dashboardIndex].widgets[widgetIndex] = data.widget;
        if (Dashboard.selected._id === data.dashboardId) {
            $('#widgets').find('.widget[data-id="' + data.widget._id + '"]').find('.header').text(data.widget.name);
        }
    } else {
        // Update the widget model in the Widget bucket,
        // and re-render the widget
        //
        // TODO - find a better way to bind view-rendering to the model changes.
        Dashboard.all[dashboardIndex].widgets[widgetIndex] = data.widget;
        if (Dashboard.selected._id === data.dashboardId) {
            var widgetView = $('#widgets').find('.widget[data-id="' + data.widget._id + '"]');
            widgetView.find('.content').html($(ss.tmpl['dashboard-widget'].render(data.widget)).find('.content').html());
            widgetView.find('style').text(data.widget.scopedCSS);
            widgetView.css({width: data.widget.width + 'px', height: data.widget.height + 'px'});
            Widget.update(data.widget);
        }
    }
});


      
// Bind on when a widget is deleted      
ss.event.on('widgetDeleted', function (data) {

    // Select the widget model object in the data Bucket
    var dashboardIndex = Dashboard.all.indexOf(Dashboard.find(data.dashboardId));

    var item, widgetObject, _i, _len, _ref;

    _ref = Dashboard.all[dashboardIndex].widgets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item._id === data.widgetId) {
            widgetObject = item;
        }
    }

    var widgetIndex    = Dashboard.all[dashboardIndex].widgets.indexOf(widgetObject);

    // Remove it from the dashboard Bucket
    if (widgetIndex !== -1) {
        Dashboard.all[dashboardIndex].widgets.splice(widgetIndex, 1);
    }

    if (Dashboard.selected._id === data.dashboardId) {

        // Remove it from the widget bucket
        Widget.remove(data.widgetId, function () {
            // Remove it from the view
            var widget = $('#widgets').find('.widget[data-id="' + data.widgetId + '"]');
            widget.fadeOut('slow', widget.remove);
        });
    }

});



// Bind on the transmission event, where a widget receives data
ss.event.on('transmission', function (data) {
    var widget = Widget.find(data._id);
    if (widget && widget.eventEmitter.widget.parent().hasClass('editMode') === false) {
        widget.eventEmitter.emit('transmission', data) ;
    }
});



// Bind on the widget's positions being updated
ss.event.on('widgetPositionsUpdated', function (data) {
    var dashboard = Dashboard.find(data._id);

    dashboard.widgets.forEach(function (widget) { widget.position = data.positions[widget._id]; });

    if (Dashboard.selected._id === data._id) {

        // A sneaky way of updating the items in the collection without triggering a reload
        // TODO - find a better way
        Widget.all.forEach(function (widget) { widget.position = data.positions[widget._id]; });
          

        // Sort the widgets in the Widget Bucket by their position number
        Widget.all.sort(function (a,b) { return a.position - b.position; });

        // Reorder the widgets on the page. 
        // TODO - Refactor this bit of code 
        // as it is duplicated in app.coffee
        Widget.all.forEach(function (widget) {
            var index = Widget.all.indexOf(widget);
            if (index < Widget.all.length) {
                $('.widget[data-id="' + widget._id + '"]')
                .after($('.widget[data-id="' + Widget.all[index+1]._id + '"]'));
            }
        });
    }

});