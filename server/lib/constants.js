'use strict';

var path        = require('path');

var define = function(propName, propValue) {
    return Object.defineProperty(module.exports, propName, {
        value:          propValue,
        enumerable:     true,
        writable:       false,
    });
};

// Development
if ('development' === process.env.NODE_ENV) {
    define('serverHost', 'localhost');
    define('serverPort', '8338');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Development

// Preproduction
if ('preproduction' === process.env.NODE_ENV) {
    define('serverHost', 'beta.pampattitu.de');
    define('serverPort', '8338');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Preproduction

// Production
if ('production' === process.env.NODE_ENV) {
    define('serverHost', 'pampattitu.de');
    define('serverPort', '8338');
    define('serverBaseUrl', 'http://' + exports.serverHost + ':' + exports.serverPort);
}
// !Production

define('databaseUri', 'mongodb://localhost/stattitu_de');

define('eventCollectionPrefix', 'even_');
define('aggregateCollectionPrefix', 'aggr_');
