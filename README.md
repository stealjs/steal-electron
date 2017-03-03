[![npm version](https://badge.fury.io/js/steal-electron.svg)](http://badge.fury.io/js/steal-electron)
[![Build Status](https://travis-ci.org/stealjs/steal-electron.svg?branch=master)](https://travis-ci.org/stealjs/steal-electron)
[![Coverage Status](https://coveralls.io/repos/github/stealjs/steal-electron/badge.svg?branch=master)](https://coveralls.io/github/stealjs/steal-electron?branch=master)

# steal-electron

Create [Electron](http://electron.atom.io/) applications from StealJS projects.

## Install

```shell
npm install steal-electron --save-dev
```

## Example

Pass [electronOptions](#electronoptions) and [StealTools.BuildResult](http://stealjs.com/docs/steal-tools.BuildResult.html) to steal-electron:

```js
var stealTools = require("steal-tools");
var stealElectron = require("steal-electron");

var electronOptions = {
  main: "electron-main.js",
  buildDir: "./build",
  platforms: ["darwin"],
  files: ["./**/*"]
};

var buildPromise = stealTools({
  config: __dirname + "/package.json!npm"
});

buildPromise.then(function(buildResult){
	stealElectron(electronOptions, buildResult);
});
```

## API

`stealElectron(electronOptions, buildResult) -> Promise`

### ElectronOptions

These are options that get passed into [electron-packager](https://github.com/electron-userland/electron-packager). Aside from the options that takes, these options are also available:

#### main

Specify your `main` Electron module:

```
main: "electron-main.js"
```

If the `main` does not exist, steal-electron will add a generate Electron module to your project.

#### indexPage

Specify the index HTML page to use. This is the page that Electron will use to launch your application.

```
indexPage: "index.production.html"
```

#### glob

Alias for `files`. Specify a glob pattern of files to move into the destination folder.

### BuildResult

The [result](http://stealjs.com/docs/steal-tools.build.html) of running StealTools multi-build.

## License

MIT
