'use strict';

var path        = require('path');

var define = function(propName, propValue) {
    return Object.defineProperty(module.exports, propName, {
        value:          propValue,
        enumerable:     true,
        writable:       false,
    });
};

define('serverPort', '8338');

define('databaseUri', 'mongodb://localhost/stattitu_de');

define('eventCollectionPrefix', 'event_');
define('aggregateCollectionPrefix', 'aggr_');
define('oldEventCollectionPrefix', 'old_');
