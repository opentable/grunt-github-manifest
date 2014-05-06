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

        if (options.commitHistoryStartDate){

            getDateFromUrlAndPath(options.commitHistoryStartDate)
                .then(getCommitHistoryFromGithub)
                .then(saveManifest)
                .then(done)
                .fail(function(err){
                    grunt.fatal.fail(err);
                })
                .done();
        }
        else{
            grunt.fatal.fail("Must supply either commitHistoryStartDateOptions or commitHistoryStartDate in task options.")
        }

        function getDateFromUrlAndPath(options){

            var deferred = q.defer();

            if (options.date){
                deferred.resolve(new Date(options.date));
                return;
            }

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

                    grunt.verbose.write("Date: " + date);
                    deferred.resolve(date);
                }
                else{
                    deferred.reject(new Error(util.format('The response from %s was %s', options.url, body)));
                }
            });

            return deferred.promise;
        };

        function getCommitHistoryFromGithub(startDate){

            var github = new GitHubApi({
                version: "3.0.0",
                host: options.github.host
                // todo: add User Agent
            });
            github.authenticate({
                type: "oauth",
                token: options.github.o_auth_token
            });

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
                    grunt.verbose.write(JSON.stringify(res));
                    deferred.resolve(JSON.parse(res));
                }
            });

            return deferred.promise;
        };

        function saveManifest(commitHistory){
            var deferred = q.defer();

            fs.writeFile("manifest/manifest.json", JSON.stringify(commitHistory), function(err){
                if (err){
                    deferred.reject(err);
                } else{
                    deferred.resolve();
                }
            });

            return deferred.promise;
        };
    });
};