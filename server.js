'use strict';

require('dotenv').config();

const app = require('koa')();
const Client = require('./lib/client');
const router = require('./routes/router');

app.use(router.routes(), router.allowedMethods());

Client.redis.on('ready', ()=>{
    app.listen(process.env.PORT || 3000);
    console.log(`Server listening on port ${process.env.PORT || 3000} @ ${(new Date).toUTCString()}`);
});