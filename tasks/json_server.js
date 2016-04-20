/*
 * grunt-json-server
 * https://github.com/tfiwm/grunt-json-server
 *
 * Copyright (c) 2014 Mitko Tschimev
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

    var jsonServer = require('json-server'),
        request  = require('superagent'),
        bodyParser = require('body-parser'),
        path = require('path');

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerTask('json_server', 'Give it a JSON or JS seed file and it will serve it through REST routes.', function () {
        var done = this.async();
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            port: 13337,
            hostname: '0.0.0.0',
            keepalive: true,
            logger: true,
            routes: undefined,
            customRoutes: undefined,
            db: ''
        });
        var server = jsonServer.create();         // Express server

        server.use(bodyParser.json());
        server.use(bodyParser.urlencoded({ extended: true }));

        if (!options.logger) {
            delete jsonServer.defaults().shift();
        }
        server.use(jsonServer.defaults());          // Default middlewares (logger, public, cors)
        var source = options.db; //filename of json file containing the database, or Json object, or url of Json file
        var port = options.port;
        var taskTarget = this.target;
        var keepAlive = this.flags.keepalive || options.keepalive;

        // Start server
        function start(router,port) {
            server.use(router); //Express router
            server
            .listen(port, options.hostname)
            .on('listening', function() {
                var hostname = options.hostname;
                var target = 'http://' + hostname + ':' + port;

                //print list of entities contained in the database (i.e. name of first level objects
                for (var prop in router.db.object) {
                    grunt.log.write(target + '/' + prop);
                }
                grunt.log.writeln('Started json rest server on ' + target);
                grunt.config.set('json_server.' + taskTarget + '.options.hostname', hostname);
                grunt.config.set('json_server.' + taskTarget + '.options.port', port);

                grunt.event.emit('json_server.' + taskTarget + '.listening', hostname, port);

                if (!keepAlive) {
                    done();
                }
            })
            .on('error', function(err) {
                if (err.code === 'EADDRINUSE') {
                    grunt.fatal('Port ' + port + ' is already in use by another process.');
                } else {
                    grunt.fatal(err);
                }
            });
        }

        grunt.log.write('Loading database from ' + source + '\n');

        if (options.routes) {
            grunt.log.write('Loading additional routes from ' + options.routes + '\n');
            var routesObject = require(path.resolve(options.routes));
            var rewriter = jsonServer.rewriter(routesObject);
            server.use(rewriter);
        }

        if (options.customRoutes) {
            for(var customPath in options.customRoutes) {
                var customRoute = options.customRoutes[customPath];
                server[customRoute.method.toLocaleLowerCase()](customPath, customRoute.handler);
            }
        }

        if (/\.json$/.test(source)) {
            var router = jsonServer.router(source);
            start(router,port);
        }

        if (/\.js$/.test(source)) {
            grunt.log.write(path.resolve(source));
            var dbobject = require(path.resolve(source)).run();
            var router = jsonServer.router(dbobject);
            start(router,port);        }

        if (/^http/.test(source)) {
            request
            .get(source)
            .end(function(err, res) {
                if (err) {
                    console.error(err);
                } else {
                    var dbobject = JSON.parse(res.text);
                    var router = jsonServer.router(dbobject);
                    start(router, port);
                }
            });
        }

        // So many people expect this task to keep alive that I'm adding an option
        // for it. Running the task explicitly as grunt:keepalive will override any
        // value stored in the config. Have fun, people.
        if (keepAlive) {
            // This is now an async task. Since we don't call the "done"
            // function, this task will never, ever, ever terminate. Have fun!
            grunt.log.write('Waiting forever...\n');
        }
    });

};
