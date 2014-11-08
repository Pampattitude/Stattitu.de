'use strict';

// Awake
// Set environment mode; possible values: 'development', 'preproduction', 'production'
var mode = process.env.NODE_ENV;
if (!mode ||
    !('development' === mode || 'preproduction' === mode || 'production' === mode)) {
    process.env.NODE_ENV = 'development';
    mode = process.env.NODE_ENV;
}
// !Awake

var async               = require('async');
var cluster             = require('cluster');
var mongoose            = require('mongoose');

var constants           = require('../lib/constants');
var printer             = require('../lib/printer');

var common              = require('./common');

var main = function() {
    printer.info('Started application in ' + process.env.NODE_ENV + ' mode');

    mongoose.connect(constants.databaseUri);
    mongoose.connection.on('error', function (err) {
        printer.error('Could not open DB connection: ' + err);
        mongoose.connection.close();
        return process.exit(1);
    });

    return mongoose.connection.once('open', function () {
        printer.info('Connected to DB "' + constants.databaseUri + '"');

        treatConfigs_(function(err) {
            if (err) {
                printer.error(err);
                return process.exit(1);
            }

            return process.exit(0);
        });
    });
};

var treatConfigs_ = function(callback) {
    var config = require('./config').configuration;
    return async.eachLimit(config, 1, function(collectionConfig, collectionCallback) {
        return common.connectToCollections_(collectionConfig.collection, function(err, eventCollection, aggregateCollection, oldEventCollection) {
            if (err) return collectionCallback(err);

            return async.series([
                function(serieCallback) {
                    printer.info('Starting processing for events of "' + collectionConfig.collection + '"');

                    return require('./process').exec(
                        collectionConfig.collection,
                        eventCollection,
                        aggregateCollection,
                        oldEventCollection,
                        collectionConfig,
                        function(err) {
                            if (err) return serieCallback(err);

                            printer.info('Processing of "' + collectionConfig.collection + '" done');
                            return serieCallback();
                        }
                    );
                },
                function(serieCallback) {
                    printer.info('Starting cleaning of "' + collectionConfig.collection + '"');

                    return require('./clean').exec(
                        collectionConfig.collection,
                        eventCollection,
                        aggregateCollection,
                        oldEventCollection,
                        collectionConfig,
                        function(err) {
                            if (err) return serieCallback(err);

                            printer.info('Cleaning of "' + collectionConfig.collection + '" done');
                            return serieCallback();
                        }
                    );
                },
            ], collectionCallback);
        });
    }, callback);
};

return main();
