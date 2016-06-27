import * as test from 'tape';
import {auth} from '../auth';
import * as Koa from 'koa';
import * as path from 'path';
import * as supertest from 'supertest';
import * as users from './';

function listen(app) {
    return app.listen();
}

let app = new Koa();

var request = supertest.agent(listen(app));

//  test path 
users.storePath = path.join(
    // BasePath 
    process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
    'test.db'
);

users.service.value.timeOut = 0;

users.routes.forEach(route =>
    app.use(route)
);

test.onFinish((err)=>{
    if(isError(err)){
        console.log(`Tape error: ${err.message}`);
    }
    process.exit();
})

test('get ok', async (t) => {
    await users.service.value.clear();
    let user = { name: 'bob', password: 'bob' };
    await users.service.value.add(user);
    await new Promise((resolve, reject) => {
        request.get('/users/bob')
            .accept('application.json')
            .expect(200)
            .expect('{"name":"bob","password":"xxxxxxxx"}')
            .end((err, res) => {
                if (err) {
                    reject(err)
                    return;
                }
                resolve(res);
                t.end();
            });
    })
});

test('Throws NotFound', async (t) => {

    let user = { name: 'bob', password: 'bob' };
    let ex = await new Promise((resolve, reject) => {
        try {
            request.get('/users/bob')
                .accept('application.json')
                // ??? 
                .expect(404)
                .end((e, r) => {
                    if (e) {
                      reject(e);
                      return;
                    }
                    resolve({});
                });
        } catch (e) {
            reject(e)
        }
    })
    t.end();
});

test('put/add/new', async (t) => {
    await users.service.value.clear();
    request.put('/users')
        .accept('application.json')
        .send({ name: "bob", password: "bob" })
        .expect(200, (e) => {
            if (e && 'error' == typeof (e)) {
                  t.fail(e.message);
                    return;
            }
            users.service.value.get('bob').then(bob => {
                if (bob.name == 'bob') {
                    t.end();
                    return;
                }
                throw new Error('Not Bob');

            })

        });
});


test('post/set/modify', async (t) => {
    let service = users.service.value;
    await users.service.value.clear();
    let user = { name: 'bob', password: 'bob1' };
    service.add(user).then(() => {
        request.post('/users')
            .accept('application.json')
            .send({ name: "bob", password: "bob" })
            .expect(200)
            //.expect('{"name":"bob","password":"bob"}')
            .end((e, r) => {
                if (e && 'error' == typeof (e)) {
                    t.fail(e.message);
                    return;
                }
                service.get('bob').then(bob => {
                    if (bob.password != 'bob1') {
                        t.fail('Bad Password');                                                
                    } else {
                        t.end();
                    }
                })
            });
    })

});

test('delete/remove',  async (t) => {
    await users.service.value.clear();
    this.timeout = 5000;
    let user = { name: 'bob', password: 'bob' };
    users.service.value.add(user).then(x => {
        request.del('/users/bob')
            .accept('application.json')
            .expect(200)
            .end((e, r) => {
                if (e) {
                    t.fail(e.message);
                    return;
                }
                users.service.value.get('bob').then(bob => {
                    if (bob) {
                        t.fail('shouldn\'t be there');
                    }
                    t.end()
                })
            });
    });
})

function isError(e: any): e is Error {
    return e instanceof Error
}