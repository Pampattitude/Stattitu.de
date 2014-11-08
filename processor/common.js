'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../lib/constants');
var printer = require('../lib/printer');

exports.connectToCollections_ = function(basename, callback) {
    var eventCollection = null;
    var aggregateCollection = null;

    printer.info('Connecting to collections for "' + basename + '"');
    return async.series([
        function(serieCallback) {
            return mongoose.connection.db.collection(constants.eventCollectionPrefix + basename, function(err, collection) {
                if (err) return serieCallback(err);

                eventCollection = collection;
                return serieCallback();
            });
        }, function(serieCallback) {
            return mongoose.connection.db.collection(constants.aggregateCollectionPrefix + basename, function(err, collection) {
                if (err) return seriecallback(err);

                aggregateCollection = collection;
                return serieCallback();
            });
        }
    ], function(err) {
        if (err)
            return callback(err);

        printer.info('Connected to collections for "' + basename + '"');
        return callback(null, eventCollection, aggregateCollection);
    });
};
