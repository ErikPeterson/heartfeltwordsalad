#!/usr/bin/env node

'use strict';

const Scraper = require('./scraper');

require('fs').readdir(require('path').join(__dirname, 'scraper_modules'), function(err, files){
	files.filter(file => /\.js$/.test(file))
		.forEach(file => Scraper.addProcessor(require(`./scraper_modules/${file}`)));

	Scraper.run()
		.then((results) => { console.log(results); });
});