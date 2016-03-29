(function () {
  // This bar chart is responsive to size, magnitude of data
  // and number of data points provided.
  // It takes the entire data array in every transmission, instead of
  // incremental updates.

  // in the data array:
  // "name" should stringify to something unique
  // "a" primary numeric value is required
  // "b" secondary numeric value is optional

  // Built in example data generator is disabled when it first
  // receives real data, but should be commented out for production.

  var widget = this.widget.get(0)
    , self   = this

  self.on('load', function () {
    head.js('javascripts/d3.v2.min.js')
    head.ready(
      function () {
        var cHeight = self.widget.height()
          , cWidth = self.widget.width()
          , bFontSize = d3.min([cHeight, cWidth])/20
          , margin = {top: 0, right: 10, bottom: bFontSize + 20, left: 10}
          , width = cWidth - margin.left - margin.right
          , height = cHeight - margin.top - margin.bottom
          , svg = d3.select(widget)
            .append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
          , bg = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
          , chart = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        chart.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', height)
        .attr('y2', height)

        self.on('transmission', update)

        // Comment out next line for production widget.
        var testing = setInterval(test(10), 3000)

        function update (data) {
          // bring widget out of testing mode if it receives real data
          if (data.apiKey) clearInterval(testing)
          data = data.data.sort(function (one, two) {
            if (one.a > two.a) return -1
            else if (one.a < two.a) return 1
            else return 0
          })
          var x = d3.scale.log()
            .domain([1, d3.max(data.map(function (i) { return i.a + (i.b || 0)}))])
            .range([0, width])
            , y = d3.scale.linear()
              .domain([0, data.length])
              .range([0, height])
            , h = height/data.length * .8
            , fontSize = h *.8
            , a = chart.selectAll('.a')
              .data(data, get('name'))
            , b = chart.selectAll('.b')
              .data(data, get('name'))
            , txt = chart.selectAll('.txt')
              .data(data, get('name'))
            , ticks = x.ticks().filter(function (ele, idx, arr) {
              var len = 10
              if (idx/len === Math.floor(idx/len)) return true
            })
            , rule = bg.selectAll('.rule')
            .data(ticks)
            , label = chart.selectAll('.mark')
            .data(ticks)

          // UPDATE
          rule.transition().duration(1000)
            .attr('x1', x)
            .attr('x2', x)
            .attr('y1', 0)
            .attr('y2', height)

          label.transition().duration(1000)
            .attr('class', 'mark')
            .attr('y', height)
            .attr('dy', bFontSize + 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', bFontSize)
            .attr('x', x)
            .text(shortNum)

          a.transition().duration(1000)
            .attr('height', h)
            .attr('width', getX)
            .attr('y', getY)

          b.transition().duration(1000)
            .attr('x', getX)
            .attr('height', h)
            .attr('width', function (d, i) { return x(d.a + (d.b || 0)) - x(d.a) })
            .attr('y', getY)


          txt.transition().duration(1000)
            .attr('y', negY)
            .attr('dy', h - 1)
            .attr('font-size', fontSize)
            .attr('y', getY)        

          // ENTER
          rule.enter().append('line')
            .attr('class', 'rule')
            .attr('y1', 0)
            .attr('y2', height)
            .attr('x1', cWidth + 10)
            .attr('x2', cWidth + 10)
            .transition().duration(1000)
            .attr('x1', x)
            .attr('x2', x)

          label.enter().append('text')
            .attr('class', 'mark')
            .attr('x', cWidth + 10)
            .attr('y', height)
            .attr('dy', bFontSize + 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', bFontSize)
            .text(shortNum)
            .transition().duration(1000)
            .attr('x', x)

          a.enter().append('rect')
            .attr('class', 'a')
            .attr('y', negY)
            .attr('height', h)
            .attr('width', getX)
            .transition().duration(1000)
            .attr('y', getY)

          b.enter().append('rect')
            .attr('class', 'b')
            .attr('y', negY)
            .attr('height', h)
            .attr('x', getX)
            .attr('width', function (d, i) { return x(d.a + (d.b || 0)) - x(d.a) })
            .transition().duration(1000)
            .attr('y', getY)

          txt.enter().append('text').attr('class', 'txt')
            .attr('y', negY)
            .attr('x', 0)
            .attr('dy', h - 1)
            .attr('font-size', fontSize)
            .attr('text-anchor', 'start')
            .text(get('name'))        
            .transition().duration(1000)
            .attr('y', getY)

          // EXIT
          rule.exit().transition().duration(1000)
            .attr('y1', height)
            .remove()

          label.exit().transition().duration(1000)
            .attr('y', cHeight + bFontSize)
            .remove()

          a.exit().transition().duration(1000)
            .attr('x', -width )
            .remove()

          b.exit().transition().duration(1000)
            .attr('x', width * 2)
            .remove()

          txt.exit().transition().duration(1000)
            .attr('x', -width )
            .remove()

          function getX (d, i) {
            return x(d.a)
          }

          function getY (d, i) {
            return y(i)
          }

          function negY (d, i) {
            return y(i) - height
          }

          function negX (d, i) {
            return x(d.a) - width
          }
        }
      })
    })

    // UTIL
    function get (prop) {
      return function (d) {
        return d[prop]
      }
    }

    function d (i) {
      return i
    }

    function shortNum (num) {
      if (num < 1000) return Math.floor(num) + ''
      else if (num < 1000000) return Math.floor(num/1000) + 'k'
      else if (num < 1000000000) return Math.floor(num/1000000) + 'M'
      else if (num < 1000000000000) return Math.floor(num/1000000000) + 'B'
      else return Math.floor(num/1000000000000) + 'T'
    }

    // TEST data generator
    function test (num) {
      var data
      , testName = 0

      more()
      return more

      function more () {
        if (!data) {
          data = d3.range(num).map(next)
        } else {
          data.map(function (i) {
            var ran = Math.random()
            i.a *= ran + .5
            i.b *= ran + .5
            return i
          })
          data.pop()
          data.push(next())
        }
        self.emit('transmission', { data: data })
      }

      function next () {
        var v = ~~(Math.random() * 100000 )
        return { name: testName += 2
          , a: v
          , b: v/9
        }
      }
    }
  }.call(this)
)