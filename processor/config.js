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
            'browser',
            'device',
            'os',
            'isBot',
        ],
    },

    {
        collection: 'uniqueSession',
        fields: [
            'referrer',
            'page',
            'browser',
            'device',
            'os',
            'isBot',
        ],
    },
];
