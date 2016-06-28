import * as test from 'tape';
import {auth} from '../auth';
import * as Koa from 'koa';
import *  as http from 'http';
import * as path from 'path';
import * as supertest from 'supertest';
import * as users from './';
import {iUserService, UserService} from './service'
import {UserService as TestUserService} from '../test/tools';
import * as Debug from 'debug';
const debug = Debug('koapp');

test.onFinish((err) => {
    if (err) {
        debug(`Tape error: ${err.message}`);
    }
    process.exit();
})

function listen(app): http.Server {
    return app.listen();
}

const getStore = async (clear:boolean) : Promise<iUserService>=> {
    try {                  
        users.service =  new TestUserService();             
        if(clear){
            await users.service.clear();
        }     
        users.service.timeOut = 0;
        return users.service;
    } catch (error) {
        debug(`settingUpStore: ${error.message}`);
        process.exit();
    }
}


test('get ok', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    var request = supertest.agent(listen(app));
    app.use(users.routes.get);
    
    const service = await getStore(false);

    request.get('/users/bob')
        .accept('application.json')
        .expect(200)
        .expect(r=> r.name == 'bob')
        .end((err, res) => {
            t.assert(err == null);
            t.end();
        });
});

test('Throws NotFound', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    var request = supertest.agent(listen(app));
    app.use(users.routes.get);
    const service = await getStore(true);
    
    //this: test Setup    
    request.get('/users/bob')
        .accept('application.json')        
        .expect(404)
        .end((e, r) => {
            t.assert(!e);
            t.end();
        });
});

test('put/add/new', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    app.use(users.routes.put);
    //app.use(users.addNewUserRoute);
    var request = supertest.agent(listen(app));
    const service = await getStore(true);
    //this: test Setup
    
    request.put('/users')
        .accept('application.json')
        .send({ name: "bob", password: "bob" })
        .expect(200, async (e) => {
            t.assert(!e);
            let bob = await service.byName('bob');
            t.assert(bob.name == 'bob');
            t.end();
        });
});


test('post/set/modify', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    var request = supertest.agent(listen(app));
    app.use(users.routes.set);    
    const service = await getStore(false);
               
    request.post('/users')
            .accept('application.json')
            .send({ name: "bob", password: "bob1" })
            .expect(200)
            .end(async (e, r) => {
                t.assert(e == null);
                let bob = await service.byName('bob');
                t.assert(bob.password == 'bob1');
                t.end();
            });
});

test('delete/remove', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    var request = supertest.agent(listen(app));
    app.use(users.routes.del);
   //app.use(users.deleteUserRoute);
    const service = await getStore(false);
    
    request.del('/users/bob')        
        .expect(200)
        .end(async (e, r) => {
            t.assert(!e);
            let bob = await service.byName('bob');
            t.assert(!bob);
            t.end();
        });
})

function isError(e: any): e is Error {
    return e instanceof Error
}