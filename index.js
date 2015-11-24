'use strict';

var prompt  = require('prompt')
  , q       = require('q')
  , request = require('request-promise');

var guid, password;

start();

// "UI" functions
function start() {
  prompt.start();
  console.log('Please log into your blockchain wallet');
  promptGet(['guid', 'password', 'api_code'])
    .then(login).then(mainMenu).catch(inputErr);
}

function login(inputs) {
  inputs = require('./credentials');
  guid = inputs.guid;
  password = inputs.password;
  return callApi('/login', guid, {
    password: password,
    api_code: inputs.api_code
  });
}

function mainMenu() {
  listOptions(
    'What would you like to do now?',
    [
      'get balance',
      'list addresses',
      'get address balance',
      'generate address',
      'archive address',
      'unarchive address',
      'send bitcoin'
    ]
  );
  return promptGet(['input']).then(function (inputs) {
    switch (Number(inputs.input)) {
      case 0: return getBalance(); break;
      case 1: return listAddresses(); break;
      case 2: return promptGet(['address']).then(getAddressBalance); break;
      case 3: return promptGet(['label']).then(generateAddress); break;
      case 4: return promptGet(['address']).then(archiveAddress); break;
      case 5: return promptGet(['address']).then(unarchiveAddress); break;
      case 6: return promptGet(['to', 'amount', 'from']).then(makePayment); break;
      default: return q.reject('quitting');
    }
  }).then(mainMenu);
}

// Wallet functions
function getBalance() {
  return callApi('/balance', guid, {
    password: password
  }).then(function (result) {
    console.log('\nYour balance: %s', result.balance);
  });
}

function listAddresses() {
  return callApi('/list', guid, {
    password: password
  }).then(function (result) {
    console.log('\nYour addresses:');
    result.addresses.forEach(function (addr, i) {
      console.log('\t%d) %s', i, addr.address);
    });
  });
}

function getAddressBalance(inputs) {
  return callApi('/address_balance', guid, {
    password: password,
    address: inputs.address
  }).then(function (result) {
    console.log('\nAddress balance: %d', result.balance);
  });
}

function generateAddress(inputs) {
  return callApi('/new_address', guid, {
    password: password,
    label: inputs.label || undefined
  }).then(function (result) {
    console.log('\nNew address: %s', result.address);
  });
}

function archiveAddress(inputs) {
  return callApi('/archive_address', guid, {
    password: password,
    address: inputs.address
  }).then(function (result) {
    console.log('\nArchived: %s', result.archived);
  });
}

function unarchiveAddress(inputs) {
  return callApi('/unarchive_address', guid, {
    password: password,
    address: inputs.address
  }).then(function (result) {
    console.log(result);
    console.log('\nUnarchived: %s', result.active);
  });
}

function makePayment(inputs) {
  return callApi('/payment', guid, {
    password: password,
    to: inputs.to,
    amount: inputs.amount,
    from: inputs.from
  }).then(function (result) {
    console.log('\nPayment sent? %s', result.success);
  });
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
    qs    : params,
    json  : true
  });
}
