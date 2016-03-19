'use strict';

const processors = [];
const Scraper = {};

Scraper.addProcessor = function(processor){
	return processors.push(processor);
};

Scraper.run = function(){
	return Promise.all(processors.map(processor => processor()))
			.then((results) => { return Promise.resolve([].concat.apply([], results))})
			.catch(Scraper.handleModuleError);
};

Scraper.handleModuleError = function(err){
	console.error(err);
	return;
};

module.exports = Scraper;