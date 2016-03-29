// The widget's html as a jQuery object
var widget = this.widget;

var h = widget.find("#hours");
var m = widget.find("#minutes");
var dots = widget.find("#dots");

var interval;

var t = false;
var offset = 0;

// This runs when the widget is loaded
this.on('load', function(data){
  startTimeWidget();
  updTime();
});

this.on('transmission', function(data){
	offset = data.offset;
});

var startTimeWidget = function(){
  interval = setInterval(updTime, 1000);
}

var updTime = function(){
  t = !t;
  var d = new Date();
  d.setMinutes(d.getMinutes() + offset);
  h.text(("0" + d.getHours()).slice(-2));
  m.text(("0" + d.getMinutes()).slice(-2));
  
  dots.css("visibility", t ? "visible" : "hidden");
}