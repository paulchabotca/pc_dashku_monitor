var os = require('os');
var monitor = require("os-monitor");
var dashku = require('dashku');
var request = require('request');
var nodemailer = require('nodemailer');




systemProperties = {"hostname": os.hostname(),"freemem": os.freemem(),"totalmem": os.totalmem(), "loadavg": os.loadavg(),"uptime": os.uptime()};

//script settings
var apiServerUrl = 'http://localhost:3000'
var loadAverage = os.loadavg();
console.log('1min:'+loadAverage[0]);
console.log('5min:'+loadAverage[1]);
console.log('15min:'+loadAverage[2]);
var loadAverage1Rnd = Math.round(loadAverage[0] * 10) / 10;
var loadAverage5Rnd = Math.round(loadAverage[1] * 10) / 10;
var loadAverage15Rnd = Math.round(loadAverage[2] * 10) / 10;

//set your connection settings here.
var smtpString = 'smtps://warnings%40cardinalfactor.net:wV4$rd4uk@mail.cardinalfactor.net';
var transporter = nodemailer.createTransport(smtpString);

//set to false to disable email option.
var mailEnabled = false;
// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Server Warnings" <warnings@cardinalfactor.net>', // sender address
    to: 'paul@xguru.com', // list of receivers
    subject: 'Server Warning: ', // Subject line
    text: '', // plaintext body
};

// SERVER LOAD WARNING TEXT
var loadWarningSubject  = 'Load average is exceptionally high!';



// send mail with defined transport object
//use this in any functions to send the email out
/*
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
*/


// basic usage
// more advanced usage with configs.
monitor.start({ delay: 5000 // interval in ms between monitor cycles
              , freemem: 1000000000 // freemem under which event 'freemem' is triggered
              , uptime: 1000000 // number of secs over which event 'uptime' is triggered
              , critical1: 1.0 // loadavg1 over which event 'loadavg1' is triggered
              , critical5: 1.5 // loadavg5 over which event 'loadavg5' is triggered
              , critical15: 2.0 // loadavg15 over which event 'loadavg15' is triggered
              , silent: false // set true to mute event 'monitor'
              , stream: false // set true to enable the monitor as a Readable Stream
              , immediate: false // set true to execute a monitor cycle at start()
              });


function secondsToHms(d) {
d = Number(d);
var h = Math.floor(d / 3600);
var m = Math.floor(d % 3600 / 60);
var s = Math.floor(d % 3600 % 60);
return ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s); }

function secondsToString(seconds)
{
var numdays = Math.floor(seconds / 86400);
var numhours = Math.floor((seconds % 86400) / 3600);
var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
var numseconds = ((seconds % 86400) % 3600) % 60;
return numdays + " days " + numhours + " hours " + numminutes + " minutes " + numseconds + " seconds";
}

var uptimePayload = {
  "bigNumber": secondsToString(os.uptime()),
  "_id": "56f9568fe6365a1e08a2c0a2",
  "apiKey": "4c4d30b9-4ba4-48ef-9dbe-c21ad2c035cd"
};

var loadavgPayload = {
  "data": {
    "loadAvg1": loadAverage1Rnd,
    "loadAvg5": loadAverage5Rnd,
    "loadAvg15": loadAverage15Rnd
  },
  "_id": "56f9e290a87265d508ea6971",
  "apiKey": "4c4d30b9-4ba4-48ef-9dbe-c21ad2c035cd"
}

// on application load, send initial data, do not wait for cycle.
function initialize(){
  dashku.setApiKey(uptimePayload.apiKey, function () {

    dashku.setApiUrl(apiServerUrl, function () {

      //send uptime to the server
      // move this to a 5 minute cycle
      dashku.transmission(uptimePayload, function (response) {

          JSON.stringify(uptimePayload);
          console.log('Sending uptime to ' + apiServerUrl + ' : ' + response.status);

      });
      //send load averages
      dashku.transmission(loadavgPayload, function (response) {

          JSON.stringify(loadavgPayload);
          console.log('Sending load averages to ' + apiServerUrl + ' : ' + response.status);

      });
/*
      dashku.transmission(cpuPayload, function (response) {

          JSON.stringify(cpuPayload);
          console.log('Sending cpu load to ' + apiServerUrl + ' : ' + response.status);

      });
*/
    });

  });
};


initialize();

//add loadaverage updates to below.
// define handler that will always fire every cycle

monitor.on('monitor', function(event) {
  loadAverage = os.loadavg();
  //get the latest uptime
  uptimePayload['bigNumber'] = secondsToString(os.uptime());
  //collect load averages
  loadavgPayload.data['loadAvg1'] = loadAverage1Rnd;
  loadavgPayload.data['loadAvg5'] = loadAverage5Rnd;
  loadavgPayload.data['loadAvg15'] = loadAverage15Rnd;


  console.log("Sending this uptime payload: "+uptimePayload['bigNumber']);
  console.log("Sending this load averages payload: "+loadavgPayload.data['loadAvg1']+'|'+loadavgPayload.data['loadAvg5']+'|'+loadavgPayload.data['loadAvg15']);
  dashku.setApiKey(uptimePayload.apiKey, function () {

    dashku.setApiUrl(apiServerUrl, function () {

      //send uptime to the server
      // move this to a 5 minute cycle
      dashku.transmission(uptimePayload, function (response) {

          console.log(JSON.stringify(uptimePayload));
          console.log('Sending uptime to ' + apiServerUrl + ' : ' + response.status);

      });
      //send load averages
      dashku.transmission(loadavgPayload, function (response) {

          console.log(JSON.stringify(loadavgPayload));
          console.log('Sending load averages to ' + apiServerUrl + ' : ' + response.status);

      });
/*
      dashku.transmission(cpuPayload, function (response) {

          JSON.stringify(cpuPayload);
          console.log('Sending cpu load to ' + apiServerUrl + ' : ' + response.status);

      });
*/
    });

  });
});

// define handler for a too high 1-minute load average
monitor.on('loadavg1', function(event) {
  console.log(event.type, loadWarningSubject);
  mailOptions['subject'] += loadWarningSubject;
  mailOptions['subject'] = 'The current server load is above what is considered normal. '

  if(mailEnabled){
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
  }
});

// define handler for a too low free memory
monitor.on('freemem', function(event) {
  console.log(event.type, 'Free memory is very low!');
});

// define a throttled handler, using Underscore.js's throttle function (http://underscorejs.org/#throttle)
monitor.throttle('loadavg5', function(event) {

  // whatever is done here will not happen
  // more than once every 5 minutes(300000 ms)

}, monitor.minutes(5));
