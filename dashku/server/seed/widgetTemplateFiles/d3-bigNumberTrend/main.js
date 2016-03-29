// The widget's html as a jQuery object
var wgt = this.widget;

//Define the percentage bounds that define color from red to green
var color_range = [-1,1];
var compare_pos = -23
var target_url = 'd3js.org';
var compare_suffix = ' DoD';

var onload = function(data){
  
// The widget's html as a jQuery object
var width = wgt.width();
var height = wgt.height()-25;
var widget = wgt.get(0);
    
head.js('/javascripts/d3.v2.min.js');
head.ready(function(){
  var f = d3.format('.3s');
  var fp = d3.format('+.1%');
  
  var div = d3.select(widget);
  div.html('');
  var svg = div.append('svg');

  data = example_data();
  
  var v = data[data.length-1][1];
  var v_compare = data[0][1];
  var date_ext = d3.extent(data, function(d){return d[0]});
  var value_ext = d3.extent(data, function(d){return d[1]});
  
  var margin=10;
  var scale_x = d3.time.scale.utc().domain(date_ext).range([margin, width-margin]);
  var scale_y = d3.scale.linear().domain(value_ext).range([height-margin,margin]);
  var colorRange = [d3.hsl(0,1,0.3), d3.hsl(120, 1, 0.3)];
  var scale_color = d3.scale
      .linear().domain(color_range)
      .interpolate(d3.interpolateHsl)
      .range(colorRange).clamp(true);
  var line = d3.svg.line()
      .x(function(d) { return scale_x(d[0])})
      .y(function(d) { return scale_y(d[1])})
      .interpolate("basis");
  
  //Drawing trend line
  var g = svg.append('g');
  var path = g.append('path')
      .attr('d', function(d){return line(data);})
      .attr('stroke-width', 5)
      .attr('opacity', 0.5)
      .attr('fill', "none")
      .attr('stroke-linecap',"round")
      .attr('stroke', "grey");
  
  
  var g = svg.append('g')
    .attr('class', 'digits')
    .attr('opacity', 1);
  
  //Printing big number 
  g.append('text')
    .attr('x', width/2)
    .attr('y', (height/16) * 7)
    .attr('class', 'big')
    .attr('id', 'bigNumber')
    .style('font-weight', 'bold')
    .style('cursor', 'pointer')
    .on('click', function(){window.location=target_url})
    .text(f(v))
    .style('font-size', height/2.5)
    .attr('fill','white');
  
  var v = 1-(v_compare/v);
  var c = scale_color(v);
  
  //Printing compare %
  g.append('text')
    .attr('x', width/2)
    .attr('y', (height/16) *12)
    .text(fp(v) + compare_suffix)
    .style('font-size', height/8)
    .style('text-anchor', 'middle')
    .attr('fill', c)
    .attr('stroke', c);
    
    var g_axis = svg.append('g').attr('class', 'axis').attr('opacity',0);
    
    var g = g_axis.append('g');
    var x_axis = d3.svg.axis()
      .scale(scale_x)
      .orient('bottom')
      .tickFormat(d3.time.format('%I%p'))
    	.ticks(4);
    g.call(x_axis);
    g.attr('transform', 'translate(0,'+ (height-margin) +')');
   
    var g = g_axis.append('g').attr('transform', 'translate('+(width-margin)+',0)');
    var y_axis = d3.svg.axis()
      .scale(scale_y)
      .orient('left')
      .tickFormat(d3.format('.3s'))
			.tickValues(value_ext);
    g.call(y_axis);
    g.selectAll('text')
      .style('text-anchor','end')
      .attr('y','-5')
      .attr('x','1');

    g.selectAll("text")
      .style('font-size','10px');
    
    g_axis.selectAll('path.domain')
      .attr('stroke-width:1px;');
    
    div.on('mouseover', function(d){
      var div = d3.select(this);
      
    	div.select('path').transition().duration(500).attr('opacity', 1)
        .style('stroke-width', '2px');
      div.select('g.digits').transition().duration(500).attr('opacity', 0.1);
      div.select('g.axis').transition().duration(500).attr('opacity', 1);
    })
    .on('mouseout', function(d){
      
      var div = d3.select(this);
    	div.select('path').transition().duration(500).attr('opacity', 0.5)
        .style('stroke-width', '5px');
      div.select('g.digits').transition().duration(500).attr('opacity', 1);
      div.select('g.axis').transition().duration(500).attr('opacity', 0);
    });
	});
}

// This runs when the widget is loaded
this.on('load', onload);
// This runs when the widget receives a transmission
this.on('transmission', function(data){
  wgt.find('#bigNumber').text(data.bigNumber);
});


var example_data = function(){
  //Building a random growing trend
	var rnd = d3.random.normal(5000000, 1000000);
  var data = [];
  for(var i=0; i<24; i++){
  	data.push([
      new Date(2013, 1, 1, i, 0, 0, 0), 
      rnd() + (i*(rnd()/40))
    ]);
  }
  
  return data;
}

onload();
