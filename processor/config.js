'use strict';

exports.configuration = [
    {
        collection: 'comment',
        fields: [
        ],
    },
    {
        collection: 'pageView',
        fields: [
            'referrer',
            'page',
        ],
    },
    {
        collection: 'uniqueSession',
        fields: [
            'referrer',
            'page',
        ],
    },
];
