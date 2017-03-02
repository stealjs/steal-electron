var assert = require("assert");
var fse = require("fs-extra");
var exists = fse.existsSync;
var readFile = fse.readFileSync;
var helpers = require("./helpers");
var stealElectron = require("../lib/main");
var cheerio = require("cheerio");

describe("steal-electron", function(){
	before(function(done){
		this.timeout(30000);

		helpers.rmdir(__dirname + "/build")
		.then(function(){
			var electronOptions = {
				buildDir: './build',
				platforms: ['darwin'],
				files: ["dist/**/*", "production.html"]
			};

			var buildResult = {
				configuration: {
					dest: __dirname + "/tests/app/dist"
				},
				loader: {
					baseURL: __dirname + "/tests/app"
				}
			};

			helpers.stubExportPackager(stealElectron, buildResult);

			var fin = function() { done(); }
			stealElectron(electronOptions, buildResult).then(fin, done);
		});
	});

	after(function(done){
		var fin = function() { done(); };
		helpers.rmdir(__dirname + "/tests/app/build")
		.then(fin, done);
	});

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