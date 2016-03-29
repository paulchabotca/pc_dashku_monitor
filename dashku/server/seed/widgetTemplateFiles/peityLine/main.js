// The widget's html as a jQuery object
var widget = this.widget;

// This runs when the widget is loaded
this.on('load', function(data){

  head.js('/javascripts/peity.min.js')
  head.ready(function(){
    
  widget.options = {
     width: widget.width()*0.8,
     height: widget.height()*0.4,
     colour: "#64C6FF",
     strokeColour: "#327AA3",
     strokeWidth: 1
   };

    widget.find(".line").peity("line",widget.options);
  });

});
// This runs when the widget receives a transmission
this.on('transmission', function(data){
  var existingData = widget.find(".line").text().split(',')
  if (existingData.length > 15) {existingData.shift() };
  if (data.value == undefined) {
    data.value = Math.floor(Math.random()*10);
  }
  existingData.push(data.value);
  widget.find(".line").text(existingData.toString(",")).change()
  widget.find(".message").text(data.message);
});