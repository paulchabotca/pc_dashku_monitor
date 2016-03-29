(function () {
  var widget = this.widget,
      data = [1,2,3],
      self = this;

  self.on('load', function () {
    head.js('javascripts/d3.v2.min.js');
    head.ready(function () {

      widget.html('let the games begin')

      self.on('transmission', function (newData) {
        data.shift();
        data.push(newData.data);
        update();
      });

      function update () {
        widget.html(data.toString());
      }
    });

  })
}.call(this))