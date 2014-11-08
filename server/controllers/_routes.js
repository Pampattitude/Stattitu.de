'use strict';

exports.defineRoutes = function(serverApp, router) {
    router.get ('/stat/:collection', require('./get.js').get);
    router.post('/stat/:collection', require('./post.js').post);

    return router;
};
