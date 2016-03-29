// The widget's html as a jQuery object
var widget = this.widget;
var widgetId = widget.parent().attr('data-id');
var load_data = {
  "targets": [
    {
      "title": "Bad",
      "color": "#ae432e",
      "start": 0,
      "width": 50
    },
    {
      "title": "OK",
      "color": "#efaa24",
      "start": 50,
      "width": 40
    },
    {
      "title": "Good",
      "color": "#77ab13",
      "start": 90,
      "width": 10
    }
  ],
  "projected": 90,
  "current":   65,
  "previous":  50
};
var bullet;

// This runs when the widget is loaded
this.on('load', function(data){
  head.js('/javascripts/d3.v2.min.js');
  head.ready(function(){
    bullet = new Bullet( ".widget[data-id='"+ widgetId +"'] .content", widget.width(), Math.round(widget.height() / 2));
    bullet.render(load_data);
  });
});

// This runs when the widget receives a transmission
this.on('transmission', function(data){
  bullet.render(data);
});

var Bullet = function( id, width, height ){
    // Some defaults
    this.previous_width = 2;
    this.xpos = 5;

    this.animation_duration = 250;

    // We create the animation canvas here
    this.svg = d3.select(id)
      .append("svg")
      .attr("width",  width )
      .attr("height", height);

    // The width and height of the bar
    this.width  = width  - 20;
    this.height = height - 20;
};

Bullet.prototype.render_scale = function( data, total ){
  this.scale = d3.scale.linear()
               .domain( [0, total])
               .range( [0,  this.width]);

  if ( !this.x_axis ) {
      this.x_axis = d3.svg.axis();
      this.x_axis.scale( this.scale )
                 .orient( "bottom" )
      this.axis = this.svg.append("g")
              .attr("class", "axis")
              .attr("transform", "translate(" +(this.xpos)+"," + (this.height) + ")");
  }

  this.x_axis.scale( this.scale );
  this.axis.call( this.x_axis );
};

Bullet.prototype.render = function( data ) {
  var self = this;
  var total = 0;

  for( var i in data.targets){
    total += data.targets[i].width;
  }
  var ratio = this.width / total;

  if ( this.targets ) {
      this.update_targets( data, ratio );
  } else {
      this.render_targets( data, ratio );
  }

  if ( this.current_bar ){
    this.update_info_bar( data, ratio );
  } else {
    this.render_info_bar( data, ratio );
  }

  this.render_scale( data, total );

  if( data.message ){
    d3.select("#message").text( data.message );
  }
}

Bullet.prototype.update_targets = function( data , ratio ) {
  var self = this;

  var targets = this.svg.selectAll( ".target" )
  .data( data.targets )
  .attr( "fill", "blue")
  .attr( "x", function( d ) {
    return self.xpos + (d.start * ratio);
  })
  .attr( "width", function(d) {
    return d.width * ratio;
  })
  .attr( "fill", function( d ) {
    return d.color;
  });

  targets.enter().insert("rect", ":first-child")
  .attr( "class", "target" )
  .attr( "fill", function( d ) {
      return d.color;
  })
  .attr( "height", this.height )
  .attr( "x", function( d ) {
    return Math.round(self.xpos + (d.start * ratio));
  })
  .attr( "width", function(d) {
    return Math.round( d.width * ratio );
  });

  this.svg.selectAll(".hinting").data( data.targets )
  .transition().duration( this.animation_duration )
  .attr( "fill", "white" )
  .attr( "width", 2)
  .attr( "height", this.height )
  .attr( "x", function( d ){
    var x =  self.xpos + (d.start  + d.width ) * ratio;
    return x - 2;
  })
  .attr( "opacity", 0.2);
}

Bullet.prototype.render_targets = function ( data, ratio ){
  var self = this;
  this.targets = this.svg.selectAll("rect");

  // Draw them initially
  this.targets.data(data.targets)
  .enter()
  .append("rect")
  .attr( "height", this.height )
  .attr( "class", "target" )
  .attr( "x", function( d ) {
    return self.xpos + (d.start * ratio);
  })
  .attr( "width", function(d) {
    return d.width * ratio;
  })
  .attr( "fill", function( d ) {
    return d.color;
  });

  this.targets.data(data.targets).enter().append("rect")
  .attr("class", "hinting")
  .attr( "fill", "white" )
  .attr( "width", 2)
  .attr( "height", this.height )
  .attr( "x", function( d ){
    var x =  self.xpos + (d.start  + d.width ) * ratio;
    return x - 2;
  })
  .attr( "opacity", 0.2);
}

/**
 * Called if we've already loaded some data
   */
Bullet.prototype.update_info_bar = function( data, ratio ){
  this.current_bar.transition().duration(this.animation_duration)
  .attr( "x",      this.xpos)
  .attr( "width",  Math.round( data.current * ratio) );

  this.previous_bar.transition().duration(this.animation_duration)
  .attr( "x",      this.xpos + (data.previous-this.previous_width) * ratio )
  .attr( "width",  this.previous_width * ratio );

    // Draw Projected
  if ( data.projected > data.current ) {
    var projected_width = (data.projected - data.current) * ratio;
    this.projected_bar.transition().duration(this.animation_duration)
    .attr( "fill", "white" )
    .attr( "x",      this.xpos + ( data.current * ratio ) )
    .attr( "width",  projected_width )
    .attr( "fill-opacity", 0.5);

    if ( data.previous > data.current ){
      this.previous_bar.attr("fill", "white").attr( "fill-opacity", 0.3);
    } else {
      this.previous_bar.attr("fill", "black").attr( "fill-opacity", 1);
    }
  }

}

Bullet.prototype.render_info_bar = function( data, ratio ){
  this.current_bar = this.svg.append( "rect" )
  .attr( "fill", "black" )
  .attr( "x",      this.xpos)
  .attr( "width",  Math.round( data.current * ratio) )
  .attr( "height", Math.floor( this.height / 3 ) )
  .attr( "y",      Math.floor( this.height / 3 ) );

  // Draw previous
  this.previous_bar = this.svg.append( "rect" )
  .attr( "fill", "black" )
  .attr( "x",      this.xpos + (data.previous-this.previous_width) * ratio )
  .attr( "y",      Math.floor( this.height / 5 ) )
  .attr( "width",  this.previous_width * ratio )
  .attr( "height", Math.floor( this.height / 5 ) * 3 );

  // Draw Projected
   this.projected_bar = this.svg.append( "rect" );
  if ( data.projected > data.current ) {
      var projected_width = (data.projected - data.current) * ratio;
      this.projected_bar.attr( "fill", "white" )
      .attr( "x",      this.xpos + ( data.current * ratio ) )
      .attr( "y",      Math.floor( this.height/3 ) )
      .attr( "width",  projected_width )
      .attr( "height", Math.floor( this.height/3 ) )
      .attr( "fill-opacity", 0.5);

    if ( data.previous > data.current ){
      this.previous_bar.attr("fill", "white").attr( "fill-opacity", 0.3);
    }
  }
}