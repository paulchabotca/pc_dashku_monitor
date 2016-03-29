// The widget's html as a jQuery object
var widget = this.widget;

// This runs when the widget is loaded
this.on('load', function(data){
  head.js('/javascripts/peity.min.js');
});
// This runs when the widget receives a transmission
this.on('transmission', function(data){
  head.ready(function(){
    widget.html(
      "<span class='pie' data-diameter='80'>"
      +data.amount+"/"+data.total+"</span>"
    );
    widget.find("span.pie").peity("pie", {
      colours: [data.colours.total,data.colours.amount],
      diameter: widget.height()/1.7
    });
  });

});