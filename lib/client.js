'use strict';

const redis = require('redis');
const bluebird = require('bluebird');
const ChainDictionary = require('../lib/chain_dictionary');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const redisClient = redis.createClient();

var Client = {};

Client.redis = redisClient;

Client.addText = function(text, author){
    let index;

    return Client.redis
            .rpushAsync('markov-texts', `${text}`)
            .then((n) => {
                index = n;
                return Client.redis
                        .multi()
                        .sadd('authors', author)
                        .rpush(`authors:${author}:index`, n - 1)
                        .execAsync();
            }).then(()=>{
                return Promise.resolve(index);
            });
};

Client.getTexts = function(){
    return Client.redis.lrangeAsync('markov-texts', 0, -1);
};

Client.getText = function(index){
    return Client.redis.lindexAsync('markov-texts', index - 1);
};

Client.getAuthorForText = function(index){
    return Client.redis
            .smembersAsync('authors')
            .then((authors)=>{
                let keys = authors.map((author) => {`authors:${author}:index`});
                return Promise.all(keys.map((key) => { Client.sismemberAsync}))
                    .then((results) =>{
                        return Promise.resolve(keys[results.indexOf(true)]);
                    });
            });
};

Client.getAuthorTexts = function(author){
    return Client.redis
            .lrangeAsync(`authors:${author}:index`, 0, -1)
            .then((index) => {
                if(!index.length) return Promise.resolve([])
                let multi = Client.redis.multi();
                for(let i of index){
                    multi = multi.lindex('markov-texts', index);
                }

                return multi.execAsync();
            });
};

Client.setUser = function(username, options){
    let multi = Client.redis.multi();
    multi = multi.sadd('users', username);
    if(options.password) multi = multi.hset(`users:${username}`, 'password', options.password);
    multi = multi.hgetall(`users:${username}`);
    return multi.execAsync()
            .then((results) => {
                let user = results[results.length - 1];
                return Promise.resolve(user);
            });
};

Client.getUser = function(username){
    return Client.redis.hgetallAsync(`users:${username}`);
};

Client.getResponse = function(length){
    if(!ChainDictionary.chains['all']){
        return Client.getTexts()
            .then((texts) => {
                let text = texts.join(' ');
                return ChainDictionary
                        .add('all', text);
            }).then((chain) => {
                return ChainDictionary.random('all', length);
            });
    } else{
        return ChainDictionary.random(all, length);
    }
};

module.exports = Client;