var asap = require("pdenodeify");
var cheerio = require("cheerio");
var fs = require("fs");
var path = require("path");

var readFile = asap(fs.readFile);
var writeFile = asap(fs.writeFile);

module.exports = HTMLRewriter;

function HTMLRewriter(options){
	options = options || {};
	this.options = options;

	this.root = options.cwd || process.cwd();

	this.restore = this.restore.bind(this);
}

HTMLRewriter.prototype = {
	/*
	 * Rewrites the production.html file
	 * so that the env=nw-production
	**/
	rewrite: function(){
		var prodHtmlPath = this.html = this.findHTML();

		if(!prodHtmlPath) {
			return;
		}

		return readFile(prodHtmlPath, "utf8")
		.then(function(src){
			this.originalSource = src;

			var $ = cheerio.load(src);
			var stealScript;
			$("script").each(function(idx, el){
				var $el = $(el);
				var src = $el.attr("src");
				if(/steal\.production\.js/.test(src)) {
					stealScript = $el;
					return false;
				}
			});

			if(stealScript) {
				stealScript.attr("env", "electron-production");
				return writeFile(prodHtmlPath, $.html(), "utf8")
			}
		}.bind(this))
		.catch(function(){
			// We don't want the copy to fail just because of this
		})

	},

	restore: function(){
		if(!this.originalSource) {
			return Promise.resolve();
		}
		if(this.hasRestored) {
			return Promise.resolve();
		}

		this.hasRestored = true;

		fs.writeFileSync(this.html, this.originalSource, "utf8");
		return Promise.resolve();
	},

	findHTML: function(){
		// For now keep it simple
		return path.join(this.root, "production.html");
	}
};
