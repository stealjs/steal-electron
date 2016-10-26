[![npm version](https://badge.fury.io/js/steal-electron.svg)](http://badge.fury.io/js/steal-electron)

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
  buildDir: "./build",
  platforms: ["osx"],
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

Electron options are passed as the first argument are the same as documented on [node-webkit-builder](https://github.com/mllrsohn/node-webkit-builder).

### BuildResult

The [result](http://stealjs.com/docs/steal-tools.build.html) of running StealTools multi-build.

## License

MIT
