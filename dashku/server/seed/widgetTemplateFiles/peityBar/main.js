// The widget's html as a jQuery object
var widget = this.widget;

// This runs when the widget is loaded
this.on('load', function(data){
  head.js('/javascripts/peity.min.js');
  head.ready(function(){
    widget.find(".bar").peity('bar',{
      width: widget.width()*0.8,
      height: widget.height()*0.6,
      colour: 'yellow'
    });
  });

});
// This runs when the widget receives a transmission
this.on('transmission', function(data){
  var bar = widget.find('.bar')
  var existingData = bar.text().split(',')
  if (existingData.length > 12) {existingData.shift()};
  existingData.push(data.value);
  bar.text(existingData.join(',')).change()
});