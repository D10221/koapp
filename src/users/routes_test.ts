import * as test from 'tape';
import {auth} from '../auth';
import * as Koa from 'koa';
import *  as http from 'http';
import * as path from 'path';
import * as supertest from 'supertest';
import * as users from './';
import {UserService, iUserService} from './service';
import * as Debug from 'debug';
const debug = Debug('koapp');

function listen(app): http.Server {
    return app.listen();
}

const getStore = async () : Promise<iUserService>=> {
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
        users.timeOut = 0;
        return users;
    } catch (error) {
        debug(`settingUpStore: ${error.message}`);
        process.exit();
    }
}

test.onFinish((err) => {
    if (err) {
        debug(`Tape error: ${err.message}`);
    }
    process.exit();
})

test('get ok', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    var request = supertest.agent(listen(app));
    app.use(users.routes.get);
    //app.use(users.getUserRoute)
    //this: test Setup
    const service = await getStore();
    let user = { name: 'bob', password: 'bob' };
    await service.add(user);
    request.get('/users/bob')
        .accept('application.json')
        .expect(200)
        .expect('{"name":"bob","password":"xxxxxxxx"}')
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
    const service = await getStore();
    
    //this: test Setup    
    request.get('/users/bob')
        .accept('application.json')
        // ??? 
        .expect(404)
        .end((e, r) => {
            t.assert(!e);
            t.end()
        });
});

test('put/add/new', { skip: false }, async (t) => {
    //app: Setup ...
    let app = new Koa();
    app.use(users.routes.put);
    //app.use(users.addNewUserRoute);
    var request = supertest.agent(listen(app));
    const service = await getStore();
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
    const service = await getStore();
    //this: test Setup
        
    let user = { name: 'bob', password: 'bob' };
    await service.add(user);

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
    const service = await getStore();

    //this: test Setup    
    let user = { name: 'bob', password: 'bob' };
    await service.add(user);
    request.del('/users/bob')
        .accept('application.json')
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