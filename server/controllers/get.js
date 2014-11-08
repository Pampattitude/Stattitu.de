'use strict';

var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var printer = require('../../lib/printer');

exports.get = function(req, res) {
    var collectionName = constants.aggregateCollectionPrefix + req.params.collection;

    return mongoose.connection.db.collection(collectionName, function(err, collection) {
        if (err) {
            printer.error(err);
            return res.status(500).end();
        }

        return collection.find(req.body).toArray(function(err, docs) {
            if (err) {
                printer.error(err);
                return res.status(500).end();
            }

            return res.status(200).json(docs);
        });
    });
};
