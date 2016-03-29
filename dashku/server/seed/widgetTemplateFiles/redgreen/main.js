(function () {
  var widget = this.widget.get(0)
    , self = this

  self.on('load', function () {
    head.js('javascripts/d3.v2.min.js')
    head.ready(function () {
      var chart = d3.select(widget)
        .append('svg')
        .attr('viewBox', '0 0 200 180')
        .append('circle')
        .attr('r', 70)
        .attr('cx', 100)
        .attr('cy', 80)
        .attr('fill', 'red')
        .attr('stroke', 'white')

      self.on('transmission', function (ndata) {
        update()
      })

      function update () {
        chart.transition()
            .delay(10)
            .duration(10)
            .attr('fill', 'limegreen')
          .transition()
            .delay(100)
            .duration(100)
            .attr('fill', 'green')
          .transition()
            .delay(3000)
            .duration(3000)
            .attr('fill', 'red')
      }
    })
  })
}.call(this))