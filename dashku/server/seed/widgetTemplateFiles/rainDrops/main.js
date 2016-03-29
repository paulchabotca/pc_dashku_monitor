// The widget's html as a jQuery object
var widget = this.widget;
var widgetId = widget.parent().attr('data-id');
var particle;

// This runs when the widget is loaded
this.on('load', function(data){
  head.js('/javascripts/d3.v2.min.js')
  head.ready(function(){
    // Here is where you set the width and height of the animation
    var w = widget.width(),
      h = widget.height()-20,
      z = d3.scale.category20c(),
      i = 0,
      radius = 60 * widget.width()/widget.height();
 
    // We create the animation canvas here
    var svg = d3.select(".widget[data-id='"+ widgetId +"'] .content")
      .append("svg:svg")
      .attr("width", w)
      .attr("height", h);

    // This function emits a circle, and animates it
    particle = function (coords) {
      svg.append("svg:circle")
        .attr("cx", coords[0])
        .attr("cy", coords[1])
        .attr("r", 1e-6)
        .style("stroke", z(++i))
        .style("stroke-opacity", 1)
        .style("fill-opacity", 0)
        .transition()
          .duration(2000)
          .ease(Math.sqrt)
          .attr("r", radius)
          .style("stroke-opacity", 1e-6)
          .remove();
    }
  });
});

// This runs when the widget receives a transmission
this.on('transmission', function(data){
  if (data.coords == undefined) {
    // We set some random coordinates for the circle,
    // in the case that no coordinates were passed.
    data.coords = [
      Math.floor(Math.random()*widget.width()), 
      Math.floor(Math.random()*widget.height()-20)
    ]
  } 
  particle(data.coords);
});