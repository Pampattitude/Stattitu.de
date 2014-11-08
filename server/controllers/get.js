'use strict';

var mongoose = require('mongoose');

var printer = require('../../lib/printer');

exports.get = function(req, res) {
    var collectionName = req.params.collection;
    var minDate = req.body.minDate_;
    var maxDate = req.body.maxDate_;
    var grain = req.body.grain_;

    return mongoose.connection.db.collection(collectionName, function(err, collection) {
        if (err) {
            printer.error(err);
            return res.sendStatus(500).end();
        }

        return collection.find(req.body, function(err, docs) {
            return res.sendStatus(200).json(docs);
        });
    });
};
