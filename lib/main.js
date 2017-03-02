var asap = require("pdenodeify");
var ElectronPackager = require("electron-packager");
var fs = require("fs");
var HTMLRewriter = require("./html-rewriter");
var path = require("path");
var rimraf = require("rimraf");

module.exports = function(options, buildResult) {
	function root() {
		return buildResult.loader.baseURL.replace("file:", "");
	}

	function configureApp() {
		var pkgPath = path.join(root(), "package.json");

		return asap(fs.readFile)(pkgPath, "utf8")
		.then(function(pkgSource){
			var pkg = JSON.parse(pkgSource);
			var copyElectronMainPromise = Promise.resolve();
			var setPkgMainPromise = Promise.resolve();

			var steal = pkg.steal || (pkg.steal = {});
			var electronConfig = steal.electron;
			if(!electronConfig) {
				var electronConfig = steal.electron = {};
				electronConfig.main = "electron-main.js";
				var electronMainPath = __dirname + "/electron-main.js";
				copyElectronMainPromise = asap(fs.readFile)(electronMainPath, "utf8")
				.then(function(mainSource){
					var outPath = path.join(root(), electronConfig.main);
					return asap(fs.writeFile)(outPath, mainSource, "utf8");
				})
			}

			if(pkg.main !== electronConfig.main) {
				pkg.main = electronConfig.main;
				var pkgSource = JSON.stringify(pkg, null, " " );
				setPkgMainPromise = asap(fs.writeFile)(pkgPath, pkgSource, "utf8");
			}

			return Promise.all([copyElectronMainPromise, setPkgMainPromise]);
		});
	}

	function buildApp() {
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
			ElectronPackager(electronOptions, function(err, appPaths) {
				if(err) {
					return reject(err);
				}

				resolve();
			});
		});
	}

	var rewriter = new HTMLRewriter({
		cwd: root()
	});
	var rewritePromise = rewriter.rewrite();

	var restoreHTML = function(){
		return rewriter.restore();
	};

	process.on("exit", restoreHTML);

	return configureApp()
	.then(function(){
		return rewritePromise;
	})
	.then(function(){
		return buildApp();
	})
	.then(restoreHTML, restoreHTML);
};

function toCamelcase(str) {
	return str.replace(/\_+([a-z])/g, function (x, chr) { return chr.toUpperCase(); });
}
