# grunt-github-manifest

> Creates a manifest file from the Github commit log since a given date

[![NPM](https://nodei.co/npm/grunt-github-manifest.png)](https://nodei.co/npm/grunt-github-manifest)

## Getting Started
This plugin requires Grunt `~0.4.1`

```shell
npm install grunt-github-manifest --save-dev
```

## The "create-manifest" task

### Overview
This plugin will grab the commit log from Github from a specified date, and store this to a file.
The date is either hardcoded (using the commitHistoryStartDate.date property in the config) or retrieved from a http web service.

### Config
This plugin requires a config sections named `package-github-data` passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    create-manifest: {
        options: {
            commitHistoryStartDate: {
                url: "http://localhost:3000/deployment-info",
                path: "$.lastModifiedOn"
                date: null
            },
            manifestPath: "commit_history.json",
            github: {
                o_auth_token: "XXXXXXXX",
                user: "christriddle",
                repo: "grunt-github-manifest"
            }
        }
    }
})
```

## Options

- `commitHistoryStartDate` - the commit history start date is usually used to get all commits from the last deploy
    - `url` - Url that returns JSON data that contains the a date which can be used as the commit history start date
    - `path` - Location of date in the returned JSON data, using JSONPath
    - `date`  - [OPTIONAL] This date will be used as the commit history start date if specified
- `manifestPath` - Where to save the manifest file
- `github` - The user/repo combination to get the commit history from
    - `user`
    - `repo`
    - `o_auth_token`