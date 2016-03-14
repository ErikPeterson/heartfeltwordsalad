'use strict';

const markov = require('markov');
const ChainDictionary = {};

ChainDictionary.chains = {};

ChainDictionary.add = function(name, corpus){
    ChainDictionary.chains[name] = ChainDictionary.chains[name] || markov(2);
    return new Promise((resolve, reject) => {
        ChainDictionary.chains[name].seed(corpus, function(err){
            if(err) return reject(err);
            resolve(ChainDictionary.chains[name]);
        });
    });
};

ChainDictionary.prime = function(dictionary, text, limit){
    return ChainDictionary
            .chains[dictionary]
            .respond(text, limit)
            .join(' ');
};

ChainDictionary.random = function(dictionary, limit){
    return ChainDictionary
            .chains[dictionary]
            .respond(ChainDictionary.chains[dictionary].pick(), limit)
            .join(' ');
};

module.exports = ChainDictionary;