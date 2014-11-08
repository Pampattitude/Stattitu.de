'use strict';

var mongoose = require('mongoose');

var constants = require('../../lib/constants');
var printer = require('../../lib/printer');

exports.post = function(req, res) {
    var collectionName = constants.eventCollectionPrefix + req.params.collection;

    return mongoose.connection.db.collection(collectionName, function(err, collection) {
        if (err) {
            printer.error(err);
            return res.status(500).end();
        }

        req.body.created_ = new Date(); // Creation date
        req.body.treated_ = false; // Already treated by processor
        return collection.insert(req.body, function(err) {
            if (err) {
                printer.error(err);
                return res.status(500).end();
            }

            return res.status(200).end();
        });
    });
};
