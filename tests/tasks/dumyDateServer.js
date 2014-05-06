var http = require("http"),
    fs = require("fs"),
    server = {},
    requestFile = fs.openSync('tests/data/actual/date-request.json', 'w'),
    dateInfo = '{"lastModifiedOn" : "2014-05-01T15:40:34Z"}';

module.exports = function(grunt){
    grunt.registerTask('start-date-server', function(){
        server = http.createServer(function(request, response) {
            fs.writeSync(requestFile, JSON.stringify({ headers: request.headers, url: request.url }));

            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(dateInfo);
            response.end();
        }).listen(8888);
    });
};