// You can use 3rd-party libraries with your widget. For more information, 
// check out the Docs section titled 'Using 3rd-party JS libraries'.

// The widget's html as a jQuery object
var widget = this.widget;

// This runs when the widget is loaded
this.on('load', function (data) {
  widget.append('<div id="message">awaiting transmission</div>').hide().fadeIn('slow');
});

// This runs when the widget receives a transmission
this.on('transmission', function (data) {
  var message = widget.find('#message');
  message.text(data.message).hide().fadeIn();
});