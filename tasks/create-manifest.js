'use string';

var util = require('util'),
    request = require('request'),
    jsonPath = require('JSONPath'),
    q = require('q'),
    fs = require('fs');

module.exports = function(grunt){

    grunt.registerMultiTask('create-manifest', 'Saves to file the commit history for a Github project from a specified date', function(){

        var done = this.async(),
            options = this.options({});

        grunt.verbose.writeflags(options);

        if (!options.commitHistoryStartDate) {
            grunt.fatal("Must supply either commitHistoryStartDateOptions or commitHistoryStartDate in task options.");
        }

        var getDateFromUrlAndPath = function(options){

            var deferred = q.defer();

            if (options.date){
                grunt.verbose.writeln("Using explictly defined date");
                deferred.resolve(new Date(options.date));
                return deferred.promise;
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
                else if (response.statusCode === 200){

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

                    deferred.resolve(date);
                }
                else {
                    var badResponseError = new Error(util.format('The response from %s was %s', options.url, body));
                    grunt.verbose.writeln(badResponseError);
                    deferred.reject(badResponseError);
                }
            });

            return deferred.promise;
        };

        var getCommitHistoryFromGithub = function(startDate){
            grunt.verbose.writeln(util.format("Getting commit history from %s/%s since %s", options.github.user, options.github.repo, startDate));

            var url = util.format("https://api.github.com/repos/%s/%s/commits?since=%s", options.github.user, options.github.repo, startDate.toISOString());

            if (options.github.o_auth_token) {
                url += "&access_token=" + options.github.o_auth_token;
            }

            grunt.verbose.writeln("Sending GET request to: " + url);

            var deferred = q.defer();

            request({
                uri: url,
                proxy: options.github.proxy,
                headers: {
                    Accept: 'application/vnd.github.v3+json',
                    "User-Agent": "NodeJS Request"
                },
                method: 'GET'
            }, function(error, response, body) {
                if (error){
                    deferred.reject(error);
                }
                else if (response.statusCode >= 300) {
                    deferred.reject(new Error("Bad status code: " + response.statusCode + ". Body: " + body));
                }
                else {
                    var jsonBody = JSON.parse(body);
                    grunt.verbose.writeln(JSON.stringify(jsonBody, null, 4));
                    deferred.resolve(jsonBody);
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

        getDateFromUrlAndPath(options.commitHistoryStartDate)
            .then(function(date){
                return getCommitHistoryFromGithub(date);
            })
            .then(function(manifest){
                return saveManifest(manifest);
            })
            .catch(function(err){
                grunt.fatal(err);
            })
            .done(function(){
                grunt.verbose.writeln("Done!");
                done();
            });
    });
};
