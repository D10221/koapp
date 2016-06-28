
import * as Koa from 'koa';
import * as path from 'path';
import * as supertest from 'supertest';
import * as superagent  from  'superagent';
import * as router from 'koa-route-ts';
import * as test from 'tape';
import * as http from 'http';
import * as util from '../util';
// Debug
import * as Debug from 'debug';
const debug = Debug('koapp');
//...
import {auth} from '../auth';
//...
import * as home from '../home';
// Users
import {iUserService, UserService} from './service';
import {UserService as TestUserService} from '../test/tools';
import * as users from './';


import delay = util.delay;
import Test = test.Test;
import SuperTest = supertest.SuperTest;
type TestRequest = superagent.Request<supertest.Test>;

function listen(app): http.Server {
    return app.listen();
}

test.onFinish(e => {
    if (e) debug(`Test completed with error: ${e.message}`);
    process.exit();
})

const getStore = async (clear: boolean): Promise<iUserService> => {
    try {
        const service = new TestUserService();
        if (clear) await service.clear();
        //Repace instance 
        users.service = service;
        return service;
    } catch (error) {
        debug(`settingUpStore: ${error.message}`);
        process.exit();
    }
}
const publicRoute = router.get('/public',
    async function (args, next) {
        let ctx: Koa.Context = this;
        await delay(5);
        ctx.body = "ok";
        ctx.status = 200;
    });

test('public:200', { skip: false }, async (t) => {
    let store = await getStore(false);
    let app = new Koa();
    //public
    app.use(publicRoute);
    //Auth   
    app.use(authentication);
    //Secured
    app.use(secretRoute);    

    let request = supertest.agent(listen(app));
    request
        .get('/public')
        .expect(200)
        .end(async (err, res) => {
            await delay(5);
            t.assert(!err);
            if (err) debug(err.message);
            t.end();
        });
});

const authentication = auth(users.service.fromCredentials);

const secretRoute = router.get('/secret',
        async function (args, next) {
            let ctx: Koa.Context = this;
            await delay(5);
            ctx.body = "ok";
            //ctx.status = 200;
        });

test('secret:401', { skip: false }, async (t) => {
    let store = await getStore(false);
    let app = new Koa()
    //Auth   
    app.use(authentication);
    //Secured
    app.use(secretRoute);    
    //...
    let request = supertest.agent(listen(app));
    request.get('/secret')
        .expect(401)
        .end(async (err, res) => {
            await delay(5);
            t.assert(!err);
            if (err) debug(`Agent: Error: ${err.message}`);
            t.end();
        });
});

test('secret:200', { skip: true }, async (t) => {

    let store = await getStore(false);
    let app = new Koa()
    //Auth   
    app.use(auth(users.service.fromCredentials));
    //Secured
    app.use(router.get('/secret',
        async function (args, next) {
            let ctx: Koa.Context = this;
            await delay(5);
            ctx.body = "ok";
            //ctx.status = 200;
        }));

    let request = supertest.agent(listen(app));
    let a = `Basic ${new Buffer('admin:admin').toString('Base64')}`;
    request.get('/secret')
        .set('Authentication', a)
        .expect(200).end(async (err, res) => {
            await delay(5);
            t.assert(!err);
            if (err) debug(`Agent: Error: ${err.message}`);
            t.end();
        });
});


// test('super-secret:409', { skip: true }, async (t) => {
//     let store = await getStore(false);    
//     let app = getApp();
//     let request = supertest.agent(listen(app));
//     request.get('/secret')
//         .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
//         .expect(409).end(async (err, res) => {
//             await delay(5);
//             t.assert(!err);
//             if (err) debug(`Agent: Error: ${err.message}`);
//             t.end();
//         });
// });


// test('super-secret:200', { skip: true }, async (t) => {
//     let store = await getStore(false);
//     let app = getApp();
//     let request = supertest.agent(listen(app));

//     request.get('/secret')
//         .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
//         .expect(200).end(async (err, res) => {
//             await delay(5);
//             t.assert(!err);
//             if (err) debug(`Agent: Error: ${err.message}`);
//             t.end();
//         });
// });
