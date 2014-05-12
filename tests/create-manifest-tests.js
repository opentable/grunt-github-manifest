var fs = require('fs'),
    should = require('should'),
    _ = require('underscore-node'),
    q = require('q');

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

    it('should contain a commit', function(){
        var jsonBody = JSON.parse(actual);
        jsonBody.length.should.be.greaterThan(0);
    });

    // This test is flaky and will eventually not work if commit count exceed 30 (since the github-api only returns 30 results)
    // I need a better way to test that the date from the date service was retrieved successfully and passed to github
    it('should only contain commits after the specified dates', function(){
        var jsonBody = JSON.parse(actual);
        var shaOfCommitThatWasBeforeTheSpecifiedDate = "74d85eeba6d8b5c485efa7f05e80abf80ca0eafa";

        _.every(jsonBody, function(commit) { return commit.sha !== shaOfCommitThatWasBeforeTheSpecifiedDate;})
            .should.equal(true);
    });
});
