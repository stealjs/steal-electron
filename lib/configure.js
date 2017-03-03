var asap = require("pdenodeify");
var fse = require("fs-extra");
var path = require("path");

module.exports = function(root) {
	var pkgPath = path.join(root, "package.json");

	return asap(fse.readFile)(pkgPath, "utf8")
	.then(function(pkgSource){
		var pkg = JSON.parse(pkgSource);
		var copyElectronMainPromise = Promise.resolve();
		var setPkgMainPromise = Promise.resolve();

		var steal = pkg.steal || (pkg.steal = {});
		var electronConfig = steal.electron;
		var shouldUpdatePackageJSON = !electronConfig;
		if(!electronConfig) {
			electronConfig = steal.electron = {};
			electronConfig.main = "electron-main.js";
			var electronMainPath = __dirname + "/../templates/electron-main.js";
			copyElectronMainPromise = asap(fse.readFile)(electronMainPath, "utf8")
			.then(function(mainSource){
				var outPath = path.join(root, electronConfig.main);
				return asap(fse.writeFile)(outPath, mainSource, "utf8");
			});
		}

		// We need to update the package.json if either the main has changed
		// or the steal.electron config didn't previously exist.
		shouldUpdatePackageJSON = shouldUpdatePackageJSON ||
			pkg.main !== electronConfig.main;

		if(shouldUpdatePackageJSON) {
			pkg.main = electronConfig.main;
			pkgSource = JSON.stringify(pkg, null, "  ");
			setPkgMainPromise = asap(fse.writeFile)(pkgPath, pkgSource, "utf8");
		}

		return Promise.all([copyElectronMainPromise, setPkgMainPromise]);
	});
};
