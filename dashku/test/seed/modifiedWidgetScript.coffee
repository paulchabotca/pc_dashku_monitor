@on 'load', (data) =>
  @widget.append("<div id='message'>hello everyone</div>")

@on 'transmission', (data) =>
  message = @widget.find '#message'
  message.text(data.version)