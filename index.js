'use strict';

var prompt  = require('prompt')
  , q       = require('q')
  , request = require('request-promise');

start();

// Action functions
function start() {
  prompt.start();
  console.log('Please log into your blockchain wallet');
  promptGet(['guid', 'password', 'api_code'])
    .then(login).then(mainMenu).catch(inputErr);
}

function login(inputs) {
  return callApi('/login', inputs.guid, {
    password: inputs.password,
    api_code: inputs.api_code
  });
}

function mainMenu() {
  listOptions(
    'What would you like to do now?',
    ['get balance', 'list addresses']
  );
}

// Helper functions
function promptGet(prompts) {
  var deferred = q.defer();
  prompt.get(prompts, function (err, result) {
    err ? deferred.reject(err) : deferred.resolve(result);
  });
  return deferred.promise;
}

function listOptions(desc, opts) {
  console.log('\n%s', desc);
  opts.forEach(function (opt, i) {
    console.log('[%d] %s', i, opt);
  });
}

function inputErr(err) {
  console.log('Oh no! Error: %s', err);
}

// Network
function callApi(endpoint, guid, params) {
  return request({
    url   : 'http://localhost:5000/merchant/' + guid + endpoint,
    method: 'GET',
    qs    : params
  });
}