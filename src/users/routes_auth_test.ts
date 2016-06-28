import {auth} from '../auth';
import * as Koa from 'koa';
import * as path from 'path';
import * as supertest from 'supertest';
import * as superagent  from  'superagent';
import * as users from './';
import * as home from '../home';
import * as router from 'koa-route-ts';
import * as test from 'tape';
import * as http from 'http';
import * as util from '../util';
import * as Debug from 'debug';
import {UserService} from './service';
const debug = Debug('koapp');
//process.env.Debug = 'koapp:users:auth:test';
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

const getStore = async () => {
    try {
        const users = new UserService( path.join(
            // BasePath 
            process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
            'test.db'
        ));
                
        await users.clear();
        await users.add({
            name: 'admin',
            password: 'admin',
            email: 'admin@mail',
            roles: ['admin']
        });
        return users;
    } catch (error) {
        debug(`settingUpStore: ${error.message}`);
        process.exit();
    }
}

const getRequest = () => {
    let app = new Koa()
        .use(
        //Unsecured
        router.get('/public',
            async function (args, next) {
                let ctx: Koa.Context = this;
                await delay(5);
                ctx.body = "ok";
            }))
        //Auth   
        //.use(auth(users.fromCredentials))
        //Secured
        .use(router.get('/secret',
            async function (args, next) {
                let ctx: Koa.Context = this;
                await delay(5);
                ctx.body = "ok";
            }))
        //By Role
        .use(router.get('/super/secret',
            //users.requiresRole('batman'),
            async function (args, next) {
                let ctx: Koa.Context = this;
                await delay(5);
                ctx.body = "ok";
            }))
        //...
        .use(router.get('/error',
            async function (args, next) {
                let ctx: Koa.Context = this;
                await delay(5);
                ctx.body = 'error';
            }));

    // app.onerror(err=>{
    //     debug(`Koa: Error: ${err.message}`);
    // })

    return supertest.agent(listen(app));
}

test('public:200', { skip: false }, async (t) => {

    getRequest().get('/public').expect(200).end(async (err, res) => {
        await delay(5);
        t.assert(!err);
        if (err) debug(err.message);
        t.end();
    });
});
test('secret:401', { skip: false }, async (t) => {
    let store = getStore();
    let request = getRequest();
    //secured
    request.get('/secret').expect(401).end(async (err, res) => {
        await delay(5);
        t.assert(!err);
        if (err) debug(`Agent: Error: ${err.message}`);
        t.end();
    });
});

test('secret:200', { skip: false }, async (t) => {

    let store = getStore();

    let request = getRequest();
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


test('super-secret:409', { skip: true }, async (t) => {

    let store = getStore();

    let request = getRequest();

    request.get('/secret')
        .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
        .expect(409).end(async (err, res) => {
            await delay(5);
            t.assert(!err);
            if (err) debug(`Agent: Error: ${err.message}`);
            t.end();
        });
});


test('super-secret:200', { skip: true }, async (t) => {

    let store = getStore();

    let request = getRequest();

    request.get('/secret')
        .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
        .expect(200).end(async (err, res) => {
            await delay(5);
            t.assert(!err);
            if (err) debug(`Agent: Error: ${err.message}`);
            t.end();
        });
});
