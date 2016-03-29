@on 'load', (data) =>
  @widget.append("<div id='message'>awaiting transmission</div>").hide().fadeIn 'slow'

@on 'transmission', (data) =>
  message = @widget.find '#message'
  message.text(data.message).hide().fadeIn()