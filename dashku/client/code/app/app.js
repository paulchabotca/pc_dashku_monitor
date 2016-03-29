'use strict';



// Dependencies
//
var Helpers = require('./helpers');
var Bucket  = require('./bucket');



// ### App ####
// 
//  The application code starts with a call to see
//  if the url contains a forgotten password token.
// 
//  If it does, we pass that token to the server,
//  and check if it is valid. If it's valid, we 
//  allow the user to change their password.
// 
if (document.location.href.match('fptoken=') !== null) {

    var token = document.location.href.split('=')[1];
    ss.rpc('authentication.loadChangePassword', token, function (response) {
        if (response.status === 'success') {
            showChangePasswordState(response.token);
        } else {
            $('.container').append(ss.tmpl.alert.render({title: 'This token is invalid', message: 'It looks like you\'ve already used it before'}));
            showLogoutState();
        }
    });
} else {

    // The application url does not contain a 
    // forgotten password token. We can load the
    // application as normal.


    if (document.location.href.match('dashboard=') !== null) {

        // Render the dashboard in view-only mode
        $('.navbar').hide();
        var id = document.location.href.split('?dashboard=')[1].split('?')[0].split('&')[0];
        // We define a special bucket just for the view only-dashboard
        var DashboardViewWidget = new Bucket({

            loadFunction: function (cb) {
                // Call the server to fetch the dashboard
                ss.rpc('dashboard.externalGet', id, function (response) {
                    if (response.status === 'success') {

                        response.dashboard.widgets.sort(function (a,b) { return a.position - b.position; });
                        mainState.setState('dashboardView', response.dashboard);
                        Helpers.renderScreenSize(response.dashboard.screenWidth);
                        cb(response.dashboard.widgets);
                    } else {
                        alert('There was an error - ' + response.reason);
                        // TODO - handle error responses in a better fashion    
                    }
                });
            },

            // Bind the widget event Emitter for each widget added to the dashboard's data model.
            preAddCb: function (widget, cb) {
                widget.eventEmitter = new EE({code: widget.script, id: widget._id, scriptType: widget.scriptType});
                cb(widget);
            },

            // Bind the widget event Emitter for each widget added to the dashboard's data model.
            postUpdateCb: function (widget, cb) {
                widget.eventEmitter = new EE({code: widget.script, id: widget._id, scriptType: widget.scriptType});
                cb(widget);
            }

        });


        // Call the load function on the DashboardViewWidget bucket
        DashboardViewWidget.load();

        // Bind on the transmission event, where a widget may receive data 
        ss.event.on('transmission', function (data) {
            var widget = DashboardViewWidget.find(data._id);
            if (widget) { widget.eventEmitter.emit('transmission', data); }
        });

        // Bind on the widget created event, where we render that widget, if it
        // belongs to the dashboard that we are displaying
        ss.event.on('widgetCreated', function (data) {
            if (id === data.dashboardId) {
                DashboardViewWidget.add(data.widget, function () {
                    $('#widgets').append(ss.tmpl['dashboardView-widget'].render(data.widget));
                    var widget = DashboardViewWidget.find(data.widget._id);
                    widget.eventEmitter = new EE({code: widget.script, id: widget._id, scriptType: widget.scriptType});
                });
            }
        });

        // Bind on the widget deleted event, where we remove the widget
        // from the view from the data bucket, and the view, if it is in
        // either of those.
        //
        // TODO - find a nicer way to bind view rendering to data model changes. 
        ss.event.on('widgetDeleted', function (data) {
            DashboardViewWidget.remove(data.widgetId, function () {
                var widget = $('#widgets').find('.widget[data-id=\'' + data.widgetId + '\']');
                widget.fadeOut('slow', widget.remove);
            });
        });

        // Bind on the widget updated event, where we update the widget,
        // if it happens to be in this dashboard.
        ss.event.on('widgetUpdated', function (data) {

            var widget = DashboardViewWidget.find(data.widget._id);

            if (widget) {

                if (onlyNameChanged(widget, data.widget)) {
                    // We just make a cosmetic change to the view element
                    $('#widgets').find('.widget[data-id=\'' + data.widget._id + '\']').find('.header').text(data.widget.name);
                } else {
                    var widgetView = $('#widgets').find('.widget[data-id=\'' + data.widget._id + '\']');
                    // Replace the widget's html piece 
                    widgetView.find('.content').html($(ss.tmpl['dashboard-widget'].render(data.widget)).find('.content').html());
                    // Replace the widget's scoped CSS
                    widgetView.find('style').text(data.widget.scopedCSS);
                    // Update the widget's width and height, if adjusted
                    widgetView.css({width: data.widget.width + 'px', height: data.widget.height + 'px'});
                    // Update the widget in the Bucket. As noted before, it would be nice to tie
                    // the view updates to data model updates. Will implement this pattern in the
                    // near future. 
                    DashboardViewWidget.update(data.widget);
                }
            }
        });

        // Bind on the widget's positions being updated.
        ss.event.on('widgetPositionsUpdated', function (data) {
            if (id === data._id) {

                // Set's the widget's position attribute
                //
                for (var i=0; i<DashboardViewWidget.all.length;i++) {
                    var widge = DashboardViewWidget.all[i];
                    widge.position = data.positions[widge._id];
                }

                DashboardViewWidget.all.sort(function (a,b) { return a.position - b.position; });

                // TODO - refactor, as duplicated in widgets.coffee
                for (var j=0; j<DashboardViewWidget.all.length;j++) {
                    var widget = DashboardViewWidget.all[j];
                    if (index < DashboardViewWidget.all.length) {
                        $('.widget[data-id=\'' + widget._id + '\']')
                        .after($('.widget[data-id=\'' + DashboardViewWidget.all[j+1]._id + '\']'));
                    }
                }
            }
        });

        // Bind on the dashboard being updated
        ss.event.on('dashboardUpdated', function (dashboard) {
            if (id === dashboard._id) {
                $('.dashboardView h1.name').text(dashboard.name);
                Helpers.renderScreenSize(dashboard.screenWidth);
                Helpers.renderCSS(dashboard.css);
            }
        });

        // Bind on the dashboard being deleted
        ss.event.on('dashboardDeleted', function (dashboardId) {
            if (id === dashboardId) {
                alert('This dashboard has been deleted');
            }
        });

    } else {

        // Render the app in normal model
        ss.rpc('authentication.signedIn', function (response) {
            if (response.status === 'success') {
                showLoginState({username: response.user.username});
            } else {
                showLogoutState();
            }
        });
    }

}