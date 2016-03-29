'use strict';

// Dependencies
//
var qs = require('qs');
var parseurl = require('parseurl');

// as in Connect v2.`x
module.exports = function query(){
  return function query(req, res, next){
    if (!req.query) {
      req.query = ~req.url.indexOf('?')
        ? qs.parse(parseurl(req).query)
        : {};
    }

    next();
  };
};