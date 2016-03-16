'use strict'

const stdout = process.stdout;
const stderr = process.stderr;
const LOG_LEVELS = ['info','debug','warn','error']
const LOG_LEVEL = LOG_LEVELS.indexOf(process.env['LOG_LEVEL']);

const log = function(level, message){
	if(LOG_LEVELS.indexOf(level) < LOG_LEVEL) return;
	
	if(level === 'error'){
		stderr.write(message + '\n');
	} else{
		stderr.write(message + '\n');
	}
};

const logger = function *(next){
	let time = new Date();

	log('debug', formatRequest(this.request, time));
	try{
		yield next;
	} catch(e){
		log('error', `${e.stack}`);
	}

	time = new Date() - time;
	log('debug', `Completed ${this.status} in ${time}ms`);
}

const formatRequest = function(request, time){
	let method = request.method;
	let path = request.path;
	let params = sanitizeParams(request.params, request.body);
	return `Started [${method}] ${path} @ ${time.toUTCString()}
Params: ${params} `;
};


const sanitizeParams = function(params, body){
	if(body && typeof body === 'object') params = Object.assign({}, params, body);

	return JSON.stringify(params, undefined, ' ')
					.replace(/"(password|token)":[^,}\n]+/ig, '"$1":[FILTERED]')
};

module.exports = { middleware: logger, log: log };