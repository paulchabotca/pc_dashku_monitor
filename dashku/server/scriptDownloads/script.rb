### Instructions
#    gem install em-http-request
#    ruby dashku_WIDGETID.rb
#
require "rubygems"
require "json"
require "em-http-request"

data = JSON.parse('JSONDATA')

EventMachine.run {
  http = EventMachine::HttpRequest.new("URL").post :body => data
  http.callback {
    EventMachine.stop
  }
}