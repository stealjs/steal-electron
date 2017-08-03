var stealElectron = require("../lib/main");
var stealTools = require("steal-tools");

var electronOptions = {
	buildDir: "./build",
	platforms: ["darwin"],
	main: "electron-main.js",
	files: ["dist/**/*", "production.html"]
};

var buildPromise = stealTools.build({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

buildPromise.then(function(buildResult){
	return stealElectron(electronOptions, buildResult);
})
.then(function(){
	console.log("Build successful");
})
.catch(function(err){
	console.error(err);
});
