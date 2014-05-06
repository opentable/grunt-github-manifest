var fs = require('fs'),
    should = require('should');

describe('getting commit history start date information from date server', function(){
    var expected = JSON.parse(fs.readFileSync('tests/data/expected/date-request.json'));
    var actual = JSON.parse(fs.readFileSync('tests/data/actual/date-request.json'));

    it('should set the host correctly', function(){
        actual.headers.host.should.equal(expected.headers.host);
    });

    it('should use the correct url', function(){
        actual.url.should.equal(expected.url);
    });
});

describe('the saved manifest', function(){
    var actual = fs.readFileSync('tests/data/commit_history.json');

    it('should be non-empty', function(){
        actual.should.not.be.empty;
    });

    it('should contain the initial commit', function(){
        var jsonBody = JSON.parse(actual);
        jsonBody[jsonBody.length - 1].commit.committer.name.should.equal("ChrisRiddle");
    });
});