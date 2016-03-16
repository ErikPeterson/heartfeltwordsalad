'use strict';

require('dotenv').config();

const app = require('koa')();
const Client = require('./lib/client');
const router = require('./routes/router');
const log = require('./middleware/logger').log;

app.use(router.routes(), router.allowedMethods());

Client.redis.on('ready', ()=>{
    app.listen(process.env.PORT || 3000);
    log('debug', `Server listening on port ${process.env.PORT || 3000} @ ${(new Date).toUTCString()}`);
});