'use strict';

const Router = require('koa-router')
const router = new Router();
const api = require('./api');

router.use('/api/v1', api.routes(), api.allowedMethods());

module.exports = router;