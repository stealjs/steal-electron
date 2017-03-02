var copy = require("copy");
var fse = require("fs-extra");
var path = require("path");

exports.rmdir = function(pth){
	return new Promise(function(resolve, reject){
		fse.remove(pth, function(err){
			if(err) return reject(err);
			resolve();
		});
	});
};

exports.stubExportPackager = function(stealElectron, buildResult){
	function root() {
		return buildResult.loader.baseURL;
	}

	stealElectron.getElectronPackager = function(){
		return function(options, cb){
			var p = options.files.map(function(src){
				if(src[0] !== "/")
					src = path.join(root(), src);
				var buildDir = path.join(root(), options.buildDir);

				return new Promise(function(resolve, reject){
					copy(src, buildDir, function(err){
						if(err) return reject(err);
						resolve();
					});
				});
			});

			Promise.all(p).then(function(){
				cb();
			})
			.catch(cb);
		};
	};
}
