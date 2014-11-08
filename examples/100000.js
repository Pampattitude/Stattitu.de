var async = require('async');

var statsClient = require('./clientLib/statsClient');

var printer = require('./lib/printer');

var count = 1000;

return async.until(function() { return 0 == count--; }, function(untilCallback) {
    var postPerCountCount = 100;
    return async.until(function() { return 0 == postPerCountCount--; }, function(postCallback) {
        statsClient.post('pageView', {
            referrer: 'www.google.com',
            page: '/test',
        });
        return postCallback();
    }, function(err) {
        if (err) return untilCallback(err);

        return statsClient.get('pageView', {
            grain: 'day',
            day: 8,
            month: 11,
            year: 2014,
        }, function(err, results) {
            if (err) return untilCallback(err);

            printer.debug(JSON.stringify(results, null, 2));
            return untilCallback();
        });
    });
}, function(err) {
    if (err) {
        printer.error(err);
        return process.exit(1);
    }

    return process.exit(0);
});
