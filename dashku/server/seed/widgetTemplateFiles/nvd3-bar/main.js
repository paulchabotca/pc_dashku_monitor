(function () {
  // Adapted from http://nvd3.com/ghpages/multiBar.html
  var widget = this.widget.get(0)
    , self = this

  self.on('load', function () {
    head.js('javascripts/d3.v2.min.js'
      , 'javascripts/nv.d3.min.js'
      )
    head.ready(function () {
      d3.select(widget).append('svg')
      var data = exampleData()
        , svg = self.widget.selector + ' svg'

      var graph = nv.addGraph(function() {
        var chart = nv.models.multiBarChart();

        chart.xAxis
          .tickFormat(d3.format(',f'));

        chart.yAxis
          .tickFormat(d3.format(',.1f'));

        d3.select(svg)
          .datum(data)
          .transition().duration(500).call(chart);

        nv.utils.windowResize(chart.update);

        self.on('transmission', function (rec) {
          Object.keys(rec.data).map(function (key) {
            if (key === 'Stream0') data[0].values.push(
              { series: 0
              , x: data[0].values.length
              , y: rec.data[key]
              })
            if (key === 'Stream1') data[1].values.push(
              { series: 1
              , x: data[1].values.length
              , y: rec.data[key]
              })
            if (key === 'Stream2') data[2].values.push(
              { series: 2
              , x: data[2].values.length
              , y: rec.data[key]
              })
          })
          chart.update()
        })

        return chart;
      });

      // Code for example data.

      function stream_layers(n, m, o) {
        if (arguments.length < 3) o = 0;
        function bump(a) {
          var x = 1 / (.1 + Math.random()),
              y = 2 * Math.random() - .5,
              z = 10 / (.1 + Math.random());
          for (var i = 0; i < m; i++) {
            var w = (i / m - y) * z;
            a[i] += x * Math.exp(-w * w);
          }
        }
        return d3.range(n).map(function() {
            var a = [], i;
            for (i = 0; i < m; i++) a[i] = o + o * Math.random();
            for (i = 0; i < 5; i++) bump(a);
            return a.map(stream_index);
          });
      }

      function stream_index(d, i) {
        return {x: i, y: Math.max(0, d)};
      }

      function exampleData() {
        return stream_layers(3,10+Math.random()*100,.1).map(function(data, i) {
          return {
            key: 'Stream' + i,
            values: data
          };
        });
      }

    })
  })
}.call(this))