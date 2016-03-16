'use strict';

const Router = require('koa-router')
const router = new Router();
const api = require('./api');
const logger = require('../middleware/logger').middleware;
const bodyParser = require('koa-bodyparser');

router.use(bodyParser());
router.use(logger);
router.use('/api/v1', api.routes(), api.allowedMethods());

module.exports = router;