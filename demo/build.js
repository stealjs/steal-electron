var stealNw = require("../lib/main");
var stealTools = require("steal-tools");


var nwOptions = {
	buildDir: './build',
	platforms: ['darwin'],
	files: ["dist/**/*", "production.html"]
	//files: ["./**/*"]
};

var buildPromise = stealTools.build({
	config: __dirname + "/package.json!npm"
}, {
	minify: false
});

buildPromise.then(function(buildResult){
	return stealNw(nwOptions, buildResult);
})
.then(function(){
	console.log("Build successful");
})
.catch(function(err){
	console.error(err);
});
