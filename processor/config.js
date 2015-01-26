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
            'userAgent',
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
