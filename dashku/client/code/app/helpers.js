'use strict';



// Dependencies
//
var StateManager = require('./stateManager');
var Bucket       = require('./bucket');



// Used to store the helper functions
//
var Helpers = {};



// A helper function to sort the dashboard's menu
// items in Alphabetical order.
Helpers.sortDashboardMenuList = function (parent,child) {
  var mylist    = $(parent);
  var listitems = mylist.children(child).get();
  listitems.sort(function (a, b) {

    var compA = $(a).text().toUpperCase();
    var compB = $(b).text().toUpperCase();
    if (compA < compB) {
      return -1;
    } else {
      if (compA > compB) {
        return 1;
      } else {
        return 0;
      }
    }
  });
  listitems.reverse();
  $.each(listitems, function (idx, itm) {
    mylist.prepend(itm);
  });
};



// A helper function to serialize the form data
// into a JS object to be sent to the server
Helpers.serializeFormData = function (selector) {  
  var data = {};
  $.each($(selector).serializeArray(), function (index,key) { data[key.name] = key.value; });
  return data;
};



// A helper function that makes a Dashboard's
// widgets resizeable, by clicking on the 
// bottom-right handle, and dragging it.
Helpers.makeWidgetsResizeable = function (widget) {

  if (!widget) { widget = $('.widget'); }
  widget.resizable({
    minWidth    : 200,
    minHeight   : 180,
    grid        : [117,107],
    helper      : 'ui-resizable-helper',
    handles     : 'se',
    stop        : function () {
      ss.rpc('widget.update', {dashboardId: Dashboard.selected._id, _id: $(this).attr('data-id'), width: $(this).width(), height: $(this).height()}, function (response) {
        if (response.status === 'success') {
          // Nothing to do, the widget has been resized
        } else {
          // TODO - figure out a nice, generic way to handle these errors
          alert('There was an error - ' + response.reason);
        }
      });
    }
  });
};



// A helper function that handles the rendering
// of the Dashboard's screen size.
//
// A dashboard can have either a fixed width (the default),
// or a fluid widget (ideal for widescreen displays).
//
// TODO - refactor this chunky code
Helpers.renderScreenSize = function (size) {
  if (!size) { size = 'fixed'; }
  if (size === 'fixed') {
    $.each($('.switch-width'), function (index, element) {
      element = $(element);
      if (element.hasClass('row-fluid')) {
        element.removeClass('row-fluid').addClass('row');
      }
      if (element.hasClass('container-fluid')) {
        element.removeClass('container-fluid').addClass('container');
      }
    });
  } else {
    $.each($('.switch-width'), function (index, element) {
      element = $(element);
      if (element.hasClass('row')) {
        element.removeClass('row').addClass('row-fluid');
      }
      if (element.hasClass('container')) {
        element.removeClass('container').addClass('container-fluid');
      }
    });
  }
};



// A helper function that renders the Dashboard's CSS
//
// @param   css     String      The css to render
//
Helpers.renderCSS = function (css) {
  $('style#dashboardStyle').text(css);
};



//// Models ////

// Originally I planned to use Ben Pickles' excellent
// JSModel library to handle client-side data storage,
// but I came across a use case it didn't handle the
// way I wanted (which I can't remember now), so I 
// ended up creating a client-side model library
// called Bucket.
//
// The Bucket library is contained in the 
// clinet/code/libs directory. Like a lot of the code
// here, it needs tests, and eventually I may replace
// it, but for now, it scratches the itch.


// The Dashboard Bucket, contains dashboard data
window.Dashboard = new Bucket({

  loadFunction: function (cb) {
    ss.rpc('dashboard.getAll', function (response) {
      if (response.status === 'success') {
        cb(response.dashboards);
      }
    });
  },

  selectCb: function (dashboard) {

    // Clear all the widgets out of the Widget Bucket
    Widget.unload(function () {
      dashboard.dashboardUrl = document.location + '?dashboard=' + dashboard._id;
      // Render the dashboard nav state
      navState.setState('dashboard', {dashboards: Dashboard.all, dashboardId: dashboard._id});
      // Order the widgets in the dashboard by their position number
      dashboard.widgets.sort(function (a,b) { return a.position - b.position; });
      // Render the dashboard view for the main part of the page
      mainState.setState('dashboard', dashboard);
      // Render the screen size
      Helpers.renderScreenSize(dashboard.screenWidth);
      // Load the dashboard's widget data into the Widget Bucket
      Widget.load(function () {
        Helpers.sortDashboardMenuList('ul#dashboardMenuItems', 'li[data-dashboardid]');
        Helpers.makeWidgetsResizeable();
        // Bind the widget position update call to the widgets when they are sorted
        $('#widgets').sortable({
          handle: '.content',
          update: function () {
            var positions = {};
            $('#widgets').children().each(function (index, widget) {
              positions[$(widget).attr('data-id')] = index;
              if (index === $('#widgets').children().length - 1) {
                ss.rpc('dashboard.updateWidgetPositions', {_id: dashboard._id, positions: positions}, function (response) {
                  if (response.status === 'success') {
                    console.log('waa');
                  } else {
                    console.log('do nothing');
                    // TODO - error display in some way, and a sane way to handle the error
                  }
                });
              }
            });
          }
        });
      });
    });
  }

});



// The Widget bucket, used to contain the data for a dashboard's widgets
window.Widget = new Bucket({

  // Fetch the selected dashboard's widgets
  loadFunction: function (cb) {
    cb(Dashboard.selected.widgets);
  },

  // bind the widget's event emitter, so that it will react to receiving data transmissions.
  preAddCb: function (widget, cb) {
    try {
      widget.eventEmitter = new EE({code: widget.script, id: widget._id, scriptType: widget.scriptType});
    } catch (error) {}
    cb(widget);
  },

  // bind the widget's event emitter, so that it will react to receiving data transmissions.
  postUpdateCb: function (widget, cb) {    
    widget.eventEmitter = new EE({code: widget.script, id: widget._id, scriptType: widget.scriptType});
    cb(widget);
  }
});



// The WidgetTemplate bucked, used to contain data for widget templates. 
window.WidgetTemplate = new Bucket({
  // Fetch the widget template data from the server.
  loadFunction: function (cb) {
    ss.rpc('widgetTemplate.getAll', function (response) {
      if (response.status === 'success') {
        cb(response.widgetTemplates);
      }
    });
  }
});


//// States ////

// States are this view rendering pattern that I
// extracted from trying to render a certain 
// html template for a certain part of a page.
//
// I found that there would be times when I
// would want to update multiple parts of the 
// page, in order to render a page state i.e.
// view the account page.
//
// In order to group these state changes, as well
// as to make the switching between them visually
// smooth, I came up with a library called 
// StateManager, which you will find in the 
// client/code/app directory.
//
// There are 3 elements to manage state for:
// 
// - account 
// - nav (the links in the top of the bar, like the Dashboards menu)
// - main (the main part of the page)
//
// And a lot of different page states
//
// - homepage (the content displayed on the homepage)
// - app (the application, when you are logged in)
// - dashboard (the dashboard, as you are editing it)
// - account (the account page, with options to change email, password, or cancel account)
// - docs (the documentation page, where you can view the docs)
// - dashboardView (the dashboard, in view-only mode
//
//
// The account element (the top right section of the page, username, login/logout link)
window.accountState = new StateManager('#account');
// The homepage state for the account element (render template with login link)
accountState.addState('homepage', function () { $('#account').html(ss.tmpl['homepage-account'].r()); });
// The app state for the account element (render template with username and logout link)
accountState.addState('app', function (data) { $('#account').html(ss.tmpl['app-account'].render(data)); } );

// The nav element (the links in the top bar, like the Dashboards menu)
window.navState = new StateManager('#nav');
// The homepage state for the nav element (render template which contains no menus/links)
navState.addState('homepage', function () { $('#nav').html(ss.tmpl['homepage-nav'].r()); });
// The dashboard state for the nav element (render template which contains Dashboards menu and new widget link)
navState.addState('dashboard', function (data) { $('#nav').html(ss.tmpl['dashboard-nav'].render(data, {dashboardMenuItem: ss.tmpl['dashboard-dashboardMenuItem']})); });



// The main element (the main part of the page)
window.mainState = new StateManager('#main');



// The homepage state for the main element (render homepage template, and adjust screen size if it was set to fluid by a dashboard)
mainState.addState('homepage', function () {
  Helpers.renderScreenSize();
  $('#main').html(ss.tmpl['homepage-main'].r());
});



// The dashboard state for the main element (render dashboard template with data)
mainState.addState('dashboard', function (data) {
  $('#main').html(ss.tmpl['dashboard-main'].render(data, {widget: ss.tmpl['dashboard-widget']}));
});



// The account state for the main element (render account template with data)
mainState.addState('account', function (data) {
  Dashboard.selected = undefined;
  Helpers.renderScreenSize();
  $('#newWidget').remove();
  $('#main').html(ss.tmpl['account-main'].render(data));
});



// The docs state for the main element (render docs template)
mainState.addState('docs', function () {
  Dashboard.selected = undefined;
  Helpers.renderScreenSize();
  $('#newWidget').remove();
  $('#main').html(ss.tmpl['docs-main'].r());
});



// The dashboardView state for the main element (render dashboardView template with data)
mainState.addState('dashboardView', function (data) {
  $('#main').html(ss.tmpl['dashboardView-main'].render(data, {widget: ss.tmpl['dashboardView-widget']}));
});



// Display the signup modal when the signup link is clicked
$(document).on('click', 'a#signup', function () {
  signup.init({signupFunction: function (element) {
      ss.rpc('authentication.signup', Helpers.serializeFormData(element.find('form')), function (response) {
        if (response.status === 'success') {
          element.modal('hide').remove();
          showLoginState({username: response.user.username});
        }
        else
          alert('There was an error - '  + response.reason);
      });
      return false;
    }
  });
});



// A helper function which handles rendering the login page, via altering
// data models and page state
window.showLoginState = function (data) {

  WidgetTemplate.load();
  Dashboard.load(function () {
    // TODO - replace with "make default" dashboard
    Dashboard.select(Dashboard.all[0]);
    // TODO - think about what should happen if the response status is failure
  });
    
  accountState.setState('app', data);

};



// A helper function which handles rendering the logout page, via clearing data
// from some data buckets, and setting the state of all the elements to 'homepage'.
window.showLogoutState = function () {
  accountState.setState('homepage');
  navState.setState('homepage');
  mainState.setState('homepage');
  Dashboard.unload();
  WidgetTemplate.unload();  
};



module.exports = Helpers;