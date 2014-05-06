module.exports = function(grunt) {
    'use strict';

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
        mochaTest:{
            options: {
                reporter: 'spec'
            },
            tests:{
                src: ['tests/create-manifest-tests.js']
            }
        },
        "create-manifest": {
            test: {
                options: {
                    commitHistoryStartDate: {
                        url: "http://localhost:3000/deployment-info",
                        path: "$.lastModifiedOn"
                        // optional:
                        // date: "2014-01-01"

                        // todo: grunt option?
                    },
                    manifestPath: "manifest/commit_history.json",
                    github: {
                        o_auth_token: "f117ee2b162265dc6a598ddd2dff1ed52788dc82",
                        user: "christriddle",
                        repo: "location-nodejs",
                        host: null
                    }
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.registerTask('test', ['jshint', 'create-manifest:test', 'mochaTest']);
    grunt.registerTask('default', ['test']);
    grunt.loadTasks('tasks');
    grunt.loadTasks('tests/tasks');
};