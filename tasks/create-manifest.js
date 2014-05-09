'use string';

var util = require('util'),
    request = require('request'),
    jsonPath = require('JSONPath'),
    q = require('q'),
    GitHubApi = require('github'),
    fs = require('fs');

module.exports = function(grunt){

    grunt.registerMultiTask('create-manifest', 'Saves to file the commit history for a Github project from a specified date', function(){

        var done = this.async(),
            options = this.options({});

        grunt.verbose.writeflags(options);

        var getDateFromUrlAndPath = function(options){

            var deferred = q.defer();

            if (options.date){
                grunt.verbose.writeln("Using explictly defined date");
                deferred.resolve(new Date(options.date));
                return;
            }

            grunt.verbose.writeln(util.format("Getting date from service %s wiht JSONpath '%s'", options.url, options.path));
            request({
                url: options.url,
                headers: {
                    Accept: 'application/json'
                },
                method: 'GET'
            }, function(error, response, body){

                if (error){
                    deferred.reject(error);
                }

                if (response.statusCode === 200){

                    grunt.verbose.write(body);

                    var date;
                    if (options.path){

                        var jsonBody = JSON.parse(body);
                        /*jslint evil: true */
                        var dateStringFromPath = jsonPath.eval(jsonBody, options.path)[0];
                        /*jslint evil: false */
                        date = new Date(dateStringFromPath);
                    }
                    else{
                        date = new Date(body);
                    }

                    grunt.verbose.writeln("Date: " + date);
                    deferred.resolve(date);
                }
                else{
                    deferred.reject(new Error(util.format('The response from %s was %s', options.url, body)));
                }
            });

            return deferred.promise;
        };

        var getCommitHistoryFromGithub = function(startDate){
            grunt.verbose.writeln(util.format("Getting commit history from %s/%s since %s", options.github.user, options.github.repo, startDate));

            var github = new GitHubApi({
                version: "3.0.0"
                // todo: add User Agent
            });

            if (options.github.o_auth_token) {
                github.authenticate({
                    type: "oauth",
                    token: options.github.o_auth_token
                });
            }

            var deferred = q.defer();

            github.repos.getCommits({
                user: options.github.user,
                repo: options.github.repo,
                since: startDate
            }, function(err, res) {
                if (err){
                    deferred.reject(err);
                }
                else{
                    grunt.verbose.writeln(JSON.stringify(res));
                    deferred.resolve(res);
                }
            });

            return deferred.promise;
        };

        var saveManifest = function(commitHistory){
            grunt.verbose.writeln("Saving manifest to " + options.manifestPath);

            var deferred = q.defer();
            var prettyPrintedJson = JSON.stringify(commitHistory, null, 4);

            fs.writeFile(options.manifestPath, prettyPrintedJson, function(err){
                if (err){
                    grunt.verbose.writeln(err);
                    deferred.reject(err);
                } else{
                    deferred.resolve();
                }
            });

            return deferred.promise;
        };

        if (options.commitHistoryStartDate){

            getDateFromUrlAndPath(options.commitHistoryStartDate)
                .then(getCommitHistoryFromGithub)
                .then(saveManifest)
                .catch(function(err){
                    grunt.fatal.fail(err);
                })
                .then(done);
        }
        else{
            grunt.fatal.fail("Must supply either commitHistoryStartDateOptions or commitHistoryStartDate in task options.");
        }
    });
};
