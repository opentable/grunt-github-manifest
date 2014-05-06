var http = require("http"),
    fs = require("fs"),
    server = {},
    requestFile = fs.openSync('tests/data/actual/date-request.json', 'w'),
    dateAfterInitialCommit = '{"lastModifiedOn" : "2014-05-06T15:28:19Z"}';

module.exports = function(grunt){
    grunt.registerTask('start-date-server', function(){
        server = http.createServer(function(request, response) {
            fs.writeSync(requestFile, JSON.stringify({ headers: request.headers, url: request.url }));

            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(dateAfterInitialCommit);
            response.end();
        }).listen(8888);
    });
};