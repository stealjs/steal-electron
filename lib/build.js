function toCamelcase(str) {
	return str.replace(/\_+([a-z])/g, function (x, chr) { return chr.toUpperCase(); });
}

module.exports = function(options, buildResult, ElectronPackager) {
	var electronOptions = {};

	// Convert the options to camelcase
	Object.keys(options).forEach(function(optName) {
		electronOptions[toCamelcase(optName)] = options[optName];
	});

	electronOptions.dir = './';
	electronOptions.out = options.buildDir;

	electronOptions.arch = options.archs;
	electronOptions.platform = options.platforms;
	electronOptions.overwrite = true;

	// Set the bundlesPath as a file to use.
	var files = electronOptions.files || electronOptions.glob || [];
	var dest = buildResult.configuration.dest;
	files = Array.isArray(files) ? files : [files];
	if(dest) {
		var globPath = dest + "/**/*";
		files.unshift(globPath);
	}

	electronOptions.files = files;

	return new Promise(function(resolve, reject){
		ElectronPackager(electronOptions, function(err) {
			if(err) {
				return reject(err);
			}

			resolve();
		});
	});
};
