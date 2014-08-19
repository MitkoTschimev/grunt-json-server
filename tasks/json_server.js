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
        path = require('path');

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('json_server', 'Give it a JSON or JS seed file and it will serve it through REST routes.', function () {
        var done = this.async();
        var low = jsonServer.low;
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            port: 13337,
            hostname: '0.0.0.0',
            keepalive: true,
            db: ''
        });

        // Load source
        function load(source, port) {
            console.log('Loading database from ' + source + '\n');

            if (/\.json$/.test(source)) {
                low.path = source;
                low.db   = jsonServer.low.db = grunt.file.readJSON(source);
                start(port);
            }

            if (/\.js$/.test(source)) {
                console.log(path.resolve(source));
                low.db   = require(path.resolve(source)).run();
                start(port);
            }

            if (/^http/.test(source)) {
                request
                .get(source)
                .end(function(err, res) {
                    if (err) {
                        console.error(err);
                    } else {
                        low.db = JSON.parse(res.text);
                        start(port);
                    }
                });
            }
        }

        var taskTarget = this.target;
        var keepAlive = this.flags.keepalive || options.keepalive;

        // Start server
        function start(port) {
            jsonServer
            .listen(port, options.hostname)
            .on('listening', function() {
                var hostname = options.hostname;
                var target = 'http://' + hostname + ':' + port;

                for (var prop in low.db) {
                    console.log(target + '/' + prop);
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

        // So many people expect this task to keep alive that I'm adding an option
        // for it. Running the task explicitly as grunt:keepalive will override any
        // value stored in the config. Have fun, people.
        if (keepAlive) {
            load(options.db, options.port);

            // This is now an async task. Since we don't call the "done"
            // function, this task will never, ever, ever terminate. Have fun!
            grunt.log.write('Waiting forever...\n');
        } else {
            done();
        }
    });

};
