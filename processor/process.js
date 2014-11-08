'use strict';

var async = require('async');
var mongoose = require('mongoose');

var constants = require('../lib/constants');
var printer = require('../lib/printer');

var common = require('./common');

exports.exec = function(baseCollectionName, eventCollection, aggregateCollection, oldEventCollection, collectionConfig, callback) {
    var nothingToDo = false;
    var lastId = null;

    return async.series([
        function(serieCallback) {
            return ensureIndices_(baseCollectionName, eventCollection, aggregateCollection, oldEventCollection, collectionConfig, serieCallback);
        },
        function(serieCallback) {
            // Get events up to a certain point, max 10000
            var aggrOptions = [
                {
                    $match: {
                        treated_: false,
                    },
                },
                {
                    $limit: 10000,
                },
                {
                    $group: {
                        _id: null,
                        lastId: {$max: '$_id'},
                        count: {$sum: 1},
                    },
                },
            ];

            return eventCollection.aggregate(aggrOptions, function(err, aggregate) {
                if (err) return serieCallback(err);

                if (!aggregate[0] || !aggregate[0].lastId) {
                    printer.info('Nothing to do for events of "' + baseCollectionName + '"');
                    nothingToDo = true;
                    return serieCallback();
                }

                printer.info(aggregate[0].count + ' events to treat');

                // Store last ID
                lastId = aggregate[0].lastId;
                return serieCallback();
            });
        }, function(serieCallback) {
            if (nothingToDo) return serieCallback();
            
            var dateList = [
                {
                    dates: {day: {$dayOfMonth: '$created_'}, month: {$month: '$created_'}, year: {$year: '$created_'}},
                    grain: 'day',
                },
                {
                    dates: {week: {$week: '$created_'}, year: {$year: '$created_'}},
                    grain: 'week',
                },
                {
                    dates: {month: {$month: '$created_'}, year: {$year: '$created_'}},
                    grain: 'month',
                },
            ];

            return async.eachSeries(dateList, function(date, dateCallback) {
                printer.info('Treating events for grain "' + date.grain + '"');

                var idFields = {};
                collectionConfig.fields.forEach(function(field) {
                    idFields[field] = '$' + field;
                });
                for (var dateElem in date.dates) {
                    idFields[dateElem] = date.dates[dateElem];
                }

                var aggrOptions = [
                    {
                        $match: {
                            _id: {$lte: lastId},
                            treated_: false,
                        },
                    },
                    {
                        $group: {
                            _id: idFields,
                            count: {$sum: 1},
                        },
                    },
                ];

                return eventCollection.aggregate(aggrOptions, function(err, aggregate) {
                    if (err) return dateCallback(err);

                    return async.eachSeries(aggregate, function(aggr, aggrCallback) {
                        var findOptions = aggr._id;

                        for (var elem in aggr._id) {
                            aggr[elem] = aggr._id[elem];
                        }
                        findOptions.grain = date.grain;

                        aggr.grain = date.grain;
                        delete aggr._id;

                        var count = aggr.count;
                        delete aggr.count;

                        return aggregateCollection.update(findOptions, {$setOnInsert: aggr, $inc: {count: count}}, {upsert: true}, aggrCallback);
                    }, function(err) {
                        if (err) return dateCallback(err);

                        printer.info('Events for grain "' + date.grain + '" treated');
                        return dateCallback();
                    });
                });
            }, serieCallback);
        }, function(serieCallback) {
            if (nothingToDo) return serieCallback();

            return eventCollection.update({_id: {$lte: lastId}, treated_: false}, {$set: {treated_: true}}, {multi: true}, function(err) {
                if (err) return serieCallback(err);

                return serieCallback();
            });
        },
    ], callback);
};

var ensureIndices_ = function(baseCollectionName, eventCollection, aggregateCollection, oldEventCollection, collectionConfig, callback) {
    return async.series([
        // Indices for treated_ in events
        function(serieCallback) {
            return aggregateCollection.ensureIndex({treated_: 1}, serieCallback);
        },
        // Indices for fields in aggregation
        function(serieCallback) {
            var indices = {};
            for (var i = 0 ; collectionConfig.fields.length > i ; ++i)
                indices[collectionConfig.fields[i]] = 1;

            return aggregateCollection.ensureIndex(indices, serieCallback);
        },
        // Indices for date in aggregation
        function(serieCallback) {
            var indices = {
                grain: 1,
                day: 1,
                week: 1,
                month: 1,
                year: 1,
            };

            return aggregateCollection.ensureIndex(indices, serieCallback);
        },
    ], callback);
};
