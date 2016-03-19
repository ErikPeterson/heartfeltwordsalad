'use strict';

const cheerio = require('cheerio');
const request = require('request-promise');
const baseUrl = 'http://archive.lovingyou.com/scripts/quotes/quotes.php';

const CATEGORIES = ['hope', 'angels', 'missyou', 'newlove', 'passion', 'proverbs'];

const getPage = function(url){
	return request({url: url, transform: cheerio});
};

const getQuotes = function($){
	return $.find('div#content p[style="line-height: 135%;"]').map(function(){
					let $el = cheerio(this);
					let quote = $el.find('i:first-of-type').text().replace(/"|\n|\r|\t/g,'');
					let author = $el.find('span.small-text:first-of-type').html().split('<br>')[0];
					author = (/source unknown/ig).test(author) ? 'anonymous' : author.replace(/(^\s+)|(\s+$)/g, '');

				return {author: author, text: quote}
			}).get().filter((quote)=>{return quote.author && quote.text;});
};

const getPageLinks = function($){
	return $.find('div#content p.small-text:last-of-type > b > a')
			.map(function(){
				return cheerio(this).attr('href');
			}).get();
};

const processCategory = function(category){
	var quotes = [];

	return getPage(`${baseUrl}?cat=${category}`)
			.then(function($){
				let links = getPageLinks($);
				quotes = getQuotes($);
				let promises = links.map((link) => {
					return getPage(`http://archive.lovingyou.com/scripts/quotes/${link}`)
							.then((page) => {
								let the_quotes = getQuotes(page)
								return Promise.resolve(the_quotes);
							});
				});
				return Promise.all(promises);
			}).then((quoteCollection) => {
				return Promise.resolve(quotes.concat([].concat.apply([], quoteCollection)));
			});
};

const run = function(){
	return Promise.all(CATEGORIES.map(processCategory)).then(function(quotes){
				return Promise.resolve([].concat.apply([], quotes));
			});
};

module.exports = run;