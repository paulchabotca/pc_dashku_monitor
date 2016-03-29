var widget = this.widget;

this.on('load', function(data) {
  return widget.lines = [];
});

this.on('transmission', function(data) {
  var line;
  line = data.line.replace(/\[90m/g, '<span class="grey">').replace(/\[32m/g, '<span class="green">').replace(/\[33m/g, '<span class="gold">').replace(/\[36m/g, '<span class="lightblue">').replace(/\[0m/g, '<span class="default">');
  widget.lines.push(line);
  widget.find('#terminalLog').append("<div>" + line + "</div>");
  if (widget.lines.length > 14) {
    widget.lines.shift();
    return widget.find("#terminalLog div:first").remove();
  }
});