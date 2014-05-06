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
                        url: "http://localhost:8888/deployment-info",
                        path: "$.lastModifiedOn"
                    },
                    manifestPath: "tests/data/commit_history.json",
                    github: {
                        user: "christriddle",
                        repo: "grunt-github-manifest"
                    }
                }
            },

            local_test: {
                options: {
                    commitHistoryStartDate: {
                        url: "http://localhost:3000/deployment-info",
                        path: "$.lastModifiedOn"

                        // optional:
                        // date: "2014-01-01" (specify an explicit date)
                    },
                    manifestPath: "commit_history.json",
                    github: {
                        o_auth_token: "f117ee2b162265dc6a598ddd2dff1ed52788dc82",
                        user: "christriddle",
                        repo: "location-nodejs"
                    }
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.registerTask('test', ['jshint', 'start-date-server', 'create-manifest:test', 'mochaTest']);
    grunt.registerTask('local_test', ['jshint', 'create-manifest:test']);
    grunt.registerTask('default', ['test']);
    grunt.loadTasks('tasks');
    grunt.loadTasks('tests/tasks');
};