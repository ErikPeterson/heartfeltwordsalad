'use strict';

const Router = require('koa-router')
const router = new Router();
const bodyParser = require('koa-bodyparser');
const auth = require('../middleware/auth');
const Client = require('../lib/client');
const randomWord = require('random-words');
const raiseError = require('../lib/raise_error');

router.use(function *(next){
    let message = 'An error occured';
    try{
        yield next;
    } catch(e) {
        switch(e.status){
            case 401:
                message = e.message || 'Unauthorized';
                break;
            case 400:
                message = e.message || 'Invalid request'
                break;
            case 404:
                message = e.message || 'Record not found'
                break;
            default:
                throw e;
        }
        this.status = e.status;
        this.body = JSON.stringify({error: message });
    }
});

router.use(bodyParser());

router.post('/sessions', 
    auth.passwordAuthParser, 
    auth.validatePassword, 
    auth.signToken,
    function *(next){
        this.status = 200;
        this.body = {token: this.jwt};
        yield next;
    }
);

router.post('/texts',
    auth.jwt,
    function *(next){
        let text = this.request.body.text.text;
        let author = this.request.body.text.author;

        if(!text || !author) raiseError(400, 'Invalid attributes');
        let index = yield Client.addText(text, author);
        this.status = 200;
        this.body = { text: { id: index, author: author, text: text }};
        yield next;
    }
);

router.get('/texts',
    function *(next){
        let texts;

        if(!this.request.query.author){
            texts = yield Client.getTexts();
        } else {
            let author_exists = yield Client.redis.sismemberAsync('authors', this.request.query.author);
            if(!author_exists) raiseError(404, 'Author not found');
            texts = yield Client.getTexts(this.request.query.author);
        }

        this.status = 200;
        this.body = { texts: texts };
    }
);

router.get('/texts/:id',
    function *(next){
        console.log(this.params);
        let text = yield Client.getText(+this.params.id);
        if(!text) raiseError(404, 'Text not found');
        let author = yield Client.getAuthorForText(+this.params.id);

        this.status = 200;
        this.body = { text: { id: +this.params.id, text: text, author: author }};

    }
);

router.get('/response',
    function *(next){
        let length = this.request.query.length || 140;
        let response = yield Client.getResponse(length);

        this.status = 200;
        this.body = { response: response };

    }
);

module.exports = router;
