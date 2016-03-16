'use strict';

const Client = require('../lib/client');
const bcrypt = require('bcrypt');
const jwt = require('koa-jwt');
const jwtFn = jwt({algorithm: 'RS256', secret: process.env['JWT_PUBLIC_KEY'], debug: process.env.NODE_ENV !== 'production'});
const raiseError = require('../lib/raise_error')

const hash = function(text){
    return new Promise((resolve, reject) => {
        bcrypt.hash(text, 10, function(err, the_hash){
            if(err) return reject(err);
            return resolve(the_hash);
        });
    });
};

const compare = function(pass, hash){
    return new Promise((resolve, reject) =>{
        bcrypt.compare(pass, hash, function(err, res){
            if(err) return reject(err);
            return resolve(res);
        });
    });
};

const setJwtUser = function *(next){
    this.user = yield Client.getUser(this.state.user.username);
    if(!this.user) raiseError(401, 'Unauthorized: user does not exist');
    yield next;
};

module.exports = {
    passwordAuthParser: function *(next){
        this.auth = {};
        this.auth.username = this.request.body.session.username;
        this.auth.password = this.request.body.session.password;
        yield next;
    },
    validatePassword: function *(next){
        let username = this.auth.username;
        let password = this.auth.password;

        let db = yield Client.getUser(username);
        let match = yield compare(password, db.password);
        if(!match) raiseError(401, 'Unauthorized: username and password do not match');
        this.user = db;
        yield next; 
    },
    signToken: function *(next){
        let time = Date.UTC() / 1000;
        let claims = {
            username: this.user.username
        };
        this.jwt = jwt.sign(claims, process.env['JWT_PRIVATE_KEY'], {algorithm: 'RS256', expiresIn: '7d'});
        yield next;
    },
    filterRole: function(roles){
        if(!Array.isArray(roles)) roles = [roles];
        return function *(next){
            if(!this.user || roles.indexOf(this.user.role) < 0) raiseError(401, 'Unauthorized: user does not have necessary privileges');
            yield next;
        }
    },
    jwt: function *(next){
        yield jwtFn.call(this, setJwtUser.call(this, next));
    }
};