var build = require("./build");
var configure = require("./configure");
var ElectronPackager = require("electron-packager");
var HTMLRewriter = require("./html-rewriter");

exports = module.exports = function(options, buildResult) {
	function root() {
		return buildResult.loader.baseURL.replace("file:", "");
	}

	var rewriter = new HTMLRewriter({
		cwd: root(),
		indexPage: options.indexPage
	});
	var rewritePromise = rewriter.rewrite();

	var restoreMainPackage;
	var restoreHTML = function(){
		return rewriter.restore();
	};

	process.on("exit", restoreHTML);

	return configure(root(), options)
	.then(function(restorePkg) {
		restoreMainPackage = restorePkg;
		return rewritePromise;
	})
	.then(function(){
		var ElectronPackager = exports.getElectronPackager();
		return build(options, buildResult, ElectronPackager);
	})
	.then(
		function() {
			return Promise.all([
				restoreHTML(),
				restoreMainPackage()
			]);
		},
		function(err) {
			restoreHTML();
			restoreMainPackage();
			return Promise.reject(err);
		}
	);
};

// This exists so we can stub it in tests
exports.getElectronPackager = function(){
	return ElectronPackager;
};
