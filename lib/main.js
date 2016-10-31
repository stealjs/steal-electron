var ElectronPackager = require("electron-packager");
var asap = require("pdenodeify");
var path = require("path");
var rimraf = require("rimraf");

module.exports = function(options, buildResult) {
	var electronOptions = {};

	// Convert the options to camelcase
	Object.keys(options).forEach(function(optName) {
		electronOptions[toCamelcase(optName)] = options[optName];
	});

	electronOptions.dir = './';
	electronOptions.out = options['buildDir'];

	electronOptions.arch = options['archs'];
	electronOptions.platform = options['platforms'];

	console.log('This is getting ran');

	// Set the bundlesPath as a file to use.
	var files = electronOptions.files || electronOptions.glob || [];
	files = Array.isArray(files) ? files : [files];
	if(buildResult && buildResult.configuration &&
	   buildResult.configuration.bundlesPath) {
		var bundlesPath = buildResult.configuration.bundlesPath;
		var globPath = path.relative(process.cwd(), bundlesPath) + "/**/*";
		files.unshift(globPath);
	}
	electronOptions.files = files;


	console.log(electronOptions);

	ElectronPackager(electronOptions, function(err, appPaths) {
		console.log(appPaths);
	});

};

function toCamelcase(str) {
	return str.replace(/\_+([a-z])/g, function (x, chr) { return chr.toUpperCase(); });
}
