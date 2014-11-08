'use strict';

var async = require('async');
var mongoose = require('mongoose');

exports.exec = function(baseCollectioName, eventCollection, aggregateCollection, oldEventCollection, collectionConfig, callback) {
    // Should move documents from event_... to oldEvent_...
    return callback();
};
