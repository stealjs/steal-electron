var asap = require("pdenodeify");
var fse = require("fs-extra");
var path = require("path");

module.exports = function(root, options) {
	var pkgPath = path.join(root, "package.json");
	var optionsMain = options.main;

	function updatePackage(pkgSource, pkgPath) {
		return asap(fse.writeFile)(pkgPath, pkgSource, "utf8");
	}

	return Promise.resolve().then(function(){
		if(!optionsMain) {
			throw new Error("electronOptions.main is required.");
		}

		return asap(fse.readFile)(pkgPath, "utf8");
	})
	.then(function(pkgSource){
		var pkg = JSON.parse(pkgSource);
		var restoreMainPackage = function() {};
		var setPkgMainPromise = Promise.resolve();
		var copyElectronMainPromise = Promise.resolve();

		var mainPath = path.join(root, optionsMain);
		copyElectronMainPromise = asap(fse.readFile)(mainPath).then(null, function(){
			// Doesn't exist, create it.
			var electronMainPath = __dirname + "/../templates/electron-main.js";
			return asap(fse.readFile)(electronMainPath, "utf8")
			.then(function(mainSource){
				return asap(fse.writeFile)(mainPath, mainSource, "utf8");
			});
		});

		// We need to update the package.json if the main has changed.
		var shouldUpdatePackageJSON = pkg.main !== optionsMain;

		if(shouldUpdatePackageJSON) {
			// callback to restore the original package.json source
			restoreMainPackage = function() {
				return updatePackage(pkgSource, pkgPath);
			};

			// update the package.json with the electron main
			pkg.main = optionsMain;
			setPkgMainPromise = updatePackage(
				JSON.stringify(pkg, null, "  "),
				pkgPath
			);
		}

		return Promise.all([setPkgMainPromise, copyElectronMainPromise])
			.then(function() {
				return restoreMainPackage;
			});
	});
};
