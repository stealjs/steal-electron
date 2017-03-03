var assert = require("assert");
var fse = require("fs-extra");
var exists = fse.existsSync;
var readFile = fse.readFileSync;
var helpers = require("./helpers");
var stealElectron = require("../lib/main");
var cheerio = require("cheerio");

describe("steal-electron", function(){
	describe("A normal application", function(){
		helpers.setup(__dirname + "/tests/app");

		it("Copies over the production files", function(){
			assert(exists(__dirname + "/tests/app/build/test/tests/app/production.html"));
		});

		it("Adds env=electron-production to the steal script tag", function(){
			var src = readFile(__dirname + "/tests/app/build/test/tests/app/production.html");
			var $ = cheerio.load(src);
			var env = $("script").attr("env");
			assert.equal(env, "electron-production", "The env attr was added");
		});

		it("The original main html doesn't have env=electron-production", function(){
			var src = readFile(__dirname + "/tests/app/production.html");
			var $ = cheerio.load(src);
			var env = $("script").attr("env");
			assert.equal(env, undefined, "There is no env attr");
		});
	});

	describe("When no electronOptions.main is provided", function(){
		helpers.setup(__dirname + "/tests/app", function(options){
			delete options.main;
		}, true);

		it("Causes a build error", function(){
			var error = this.buildError;
			assert.ok(error, "Got an error");
			assert.ok(error instanceof Error, "it's an Error");
		})
	});

	describe("A normal application - using glob config", function(){
		helpers.setup(__dirname + "/tests/app", function(options){
			options.glob = options.files.concat(["some-file.js"]);
			delete options.files;
		});

		it("Copies over files part of that glob", function(){
			assert(exists(__dirname + "/tests/app/build/test/tests/app/production.html"));
			assert(exists(__dirname + "/tests/app/build/test/tests/app/some-file.js"));
		});
	});

	describe("An app with an alternative HTML file", function(){
		helpers.setup(__dirname + "/tests/app", function(options){
			var idx = options.files.indexOf("production");
			options.files.splice(idx, 1, "other-production.html");
			options.indexPage = "other-production.html";
		});

		it("Copies over the correct production HTML", function(){
			assert(!exists(__dirname + "/tests/app/build/test/tests/app/production.html"),
				"Didn't copy over the wrong HTML file");
			assert(exists(__dirname + "/tests/app/build/test/tests/app/other-production.html"),
				"Did copy over the right HTML file");
		});

		it("Adds env=electron-production to the steal script tag", function(){
			var src = readFile(__dirname + "/tests/app/build/test/tests/app/other-production.html");
			var $ = cheerio.load(src);
			var env = $("script").attr("env");
			assert.equal(env, "electron-production", "The env attr was added");
		});
	});

	describe("An app that doesn't exist", function(){
		before(function(done){
			helpers.rmdir(__dirname + "/build")
			.then(function(){
				var electronOptions = {
					buildDir: './build',
					platforms: ['darwin'],
					files: ["dist/**/*", "production.html"]
				};

				var buildResult = {
					configuration: {
						dest: __dirname + "/tests/fake-app/dist"
					},
					loader: {
						baseURL: __dirname + "/tests/fake-app"
					}
				};

				helpers.stubExportPackager(stealElectron, buildResult);

				var fin = function() { done(); }
				stealElectron(electronOptions, buildResult).then(fin)
				.then(null, function(error){
					this.buildError = error;
					done();
				}.bind(this));
			}.bind(this));
		});

		it("Returned an error", function(){
			var error = this.buildError;
			assert.ok(error, "There was an error");
			assert.equal(error instanceof Error, true, "is an error");
		});
	});
});
