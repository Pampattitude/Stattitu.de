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
var express             = require('express');
var mongoose            = require('mongoose');

var constants           = require('../lib/constants');
var printer             = require('../lib/printer');

var main = function() {
    printer.info('Started application in ' + process.env.NODE_ENV + ' mode');

    if (cluster.isMaster) {
        global.processId = 'Master';

        var clusterPerCpu   = ('production' === process.env.NODE_ENV ? 4 : 1);
        var clusterCount    = parseInt(require('os').cpus().length * clusterPerCpu);

        cluster.on('fork', function(worker) {
            printer.info('Worker #' + worker.id + ' created');
        });
        cluster.on('exit', function (worker) {
            printer.warn('Worker #' + worker.id + ' died, forking a new one');
            cluster.fork();
        });

        for (var i = 0 ; i < clusterCount ; ++i)
            cluster.fork();

        mongoose.connect(constants.databaseUri);
        mongoose.connection.on('error', function (err) {
            printer.error('Could not open DB connection: ' + err);
            mongoose.connection.close();
            return process.exit(1);
        });

        return mongoose.connection.once('open', function () {
            printer.info('Connected to DB "' + constants.databaseUri + '"');
        });
    }
    else {
        global.processId = 'Worker #' + cluster.worker.id;

        mongoose.connect(constants.databaseUri);
        mongoose.connection.on('error', function (err) {
            printer.error('Could not open DB connection: ' + err);
            mongoose.connection.close();
            return process.exit(1);
        });

        return mongoose.connection.once('open', function () {
            printer.info('Connected to DB "' + constants.databaseUri + '"');

            // In case of a worker, run the actual server
            return runServer();
        });
    }
};

var runServer = function() {
    var serverApp = express();
    var serverRouter = express.Router();

    // Settings
    if ('preproduction' == process.env.NODE_ENV)
        serverApp.set('env', 'development');
    else
        serverApp.set('env', process.env.NODE_ENV);

    // Global middlewares
    if ('development' == process.env.NODE_ENV)
        serverApp.use(require('morgan')('dev', {
            stream: {
                write: function(str) { return printer.info(str.replace(/[\r\n]+/g, '')); },
            },
        }));
    else
        serverApp.use(require('morgan')('combined', {
            stream: {
                write: function(str) { return printer.info(str.replace(/[\r\n]+/g, '')); },
                skip: function(req, res) { return 400 >= res.statusCode; },
            },
        }));

    var bodyParser      = require('body-parser');
    var connectMongo    = require('connect-mongo');
    var cookieParser    = require('cookie-parser');
    var expressSession  = require('express-session');
    var helmet          = require('helmet');

    serverApp.use(bodyParser.urlencoded({extended: true}));
    serverApp.use(bodyParser.json());
    
    serverApp.use(require('./controllers/_routes').defineRoutes(serverApp, express.Router()));

    var port = constants.serverPort;
    serverApp.listen(port);
    printer.info('Server listening on port ' + port);
};

return main();
