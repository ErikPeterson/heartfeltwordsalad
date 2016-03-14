'use strict';

module.exports = function(code, message){
    let err = new Error(message);
    err.status = code;
    throw err;
};