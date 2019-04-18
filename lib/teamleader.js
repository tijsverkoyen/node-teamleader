'use strict';

// module dependencies
var request = require('request');
var extend = require('deep-extend');

// Package version
var VERSION = require('../package.json').version;

function Teamleader(options) {
  if (!(this instanceof Teamleader)) return new Teamleader(options);

  this.options = extend({
    group:      null,
    api_secret: null,
  }, options);

  if (this.options.group === null) {
    throw new Error('No group defined');
  }
  if (this.options.api_secret === null) {
    throw new Error('No api_secret defined');
  }

  this.VERSION = VERSION

  this.request = request.defaults({
    'headers': {
      'User-Agent': 'node-teamleader/' + VERSION
    }
  });
}

Teamleader.prototype.__buildEndpoint = function(path) {
  return 'https://app.teamleader.eu/api/' + path + '.php';
}

Teamleader.prototype.__request = function(path, params, callback)
{
  var options = {
    method: 'post',
    url:    this.__buildEndpoint(path)
  };

  // add the default fields
  params.api_group = this.options.group;
  params.api_secret = this.options.api_secret;

  options['form'] = params;

  this.request(options, function(error, response, data) {
    if (error) {
      callback(error, data, response);
    }
    else {
      try {
        data = JSON.parse(data);
      }
      catch (parseError) {
        callback(
            new Error('Status Code: ' + response.statusCode),
            data,
            response
        );

      }
      if (typeof data.errors !== 'undefined') {
        callback(data.errors, data, response);
      }
      else if (response.statusCode !== 200) {
        callback(
            new Error('Status Code: ' + response.statusCode),
            data,
            response
        );
      }
      else {
        callback(null, data, response);
      }
    }
  });
}

Teamleader.prototype.post = function(path, params, callback) {
  return this.__request(path, params, callback);
}

module.exports = Teamleader;
