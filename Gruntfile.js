/*
 * grunt-json-server
 * https://github.com/tfiwm/grunt-json-server
 *
 * Copyright (c) 2014 Mitko Tschimev
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

     // Configuration to be run (and then tested).
    json_server: {
        custom_options: {
            options: {
                port: 9100,
                db: 'test/fixtures/db.json'
            }
        }
    }
   });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');


  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint']);

};
