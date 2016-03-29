(function () {
  var widget = this.widget.get(0)
  , self = this
  , x = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  , data = [ 9, 1, 5, 6, 4, 2, 5, 3, 1, 0 ]

  self.on('load', function () {
    head.js('javascripts/raphael-min.js'
      , 'javascripts/g.raphael-min.js'
      , 'javascripts/g.line-min.js'
    )
    head.ready(function () {
      var r = Raphael(widget)

      var line = update()

      self.on('transmission', function (rec) {
        data.shift()
        data.push(rec.data)
        r.clear()
        line = update()
      })

      function update () {
        return r.linechart(10, 0, 150, 150, x, data, { axis: "0 0 1 1" })
      }
    })
  })
}.call(this))