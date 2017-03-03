var copy = require("copy");
var fse = require("fs-extra");
var exists = fse.existsSync;
var readFile = fse.readFileSync;
var writeFile = fse.writeFileSync;
var path = require("path");
var stealElectron = require("../lib/main");

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
};

exports.setup = function(projectPath, setup, dontFail){
	before(function(done){
		this.oldPackageJSON = readFile(path.join(projectPath, "package.json"));

		var electronOptions = {
			main: "electron-main.js",
			buildDir: './build',
			platforms: ['darwin'],
			files: ["dist/**/*", "production.html", "electron-main.js"]
		};

		var buildResult = {
			configuration: {
				dest: path.join(projectPath, "dist")
			},
			loader: {
				baseURL: projectPath
			}
		};

		// Allow overriding stuff
		if(setup) {
			setup(electronOptions, buildResult);
		}

		exports.stubExportPackager(stealElectron, buildResult);

		var fin = function() { done(); }
		var fail = function(err){
			if(!dontFail) {
				done(err);
				return;
			}
			this.buildError = err;
			done();
		}.bind(this);
		stealElectron(electronOptions, buildResult).then(fin, fail);
	});

	afterEach(function(done){
		exports.rmdir(path.join(projectPath, "electron-main.js"))
		.then(null, function(){})
		.then(function(){
			done();
		});
	});

	after(function(done){
		writeFile(path.join(projectPath, "package.json"), this.oldPackageJSON);

		var fin = function() { done(); };
		exports.rmdir(path.join(projectPath, "build"))
		.then(fin, done);
	});
};
