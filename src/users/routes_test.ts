import {auth} from '../auth';
import * as Koa from 'koa';
import * as path from 'path';
import {assert} from 'chai';
import * as supertest from 'supertest';
import * as users from './';



describe('Users route', () => {

    let app = new Koa();

    var request = supertest.agent(app.listen());

    //  test path 
    users.storePath = path.join(
        // BasePath 
        process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
        'test.db'
    );
    
    let userService = users.service.value;

    app.use(users.router.routes());
    
    beforeEach(async () => {        
        await userService.clear();
    });

    describe('get', () => {

        it('get ok', async () => {

            let user = { name: 'bob', password: 'bob' };
            await userService.add(user);
            await new Promise((resolve, reject) => {
                request.get('/users/bob')
                    .accept('application.json')
                    .expect(200)
                    .expect('{"name":"bob","password":"xxxxxxxx"}')
                    .end((e, r) => {
                        if (e) {
                            reject(e)
                            return;
                        }
                        resolve(r);
                    });
            })
        });

        it('Throws NotFound', async () => {

            let user = { name: 'bob', password: 'bob' };
            let ex = await new Promise((resolve, reject) => {
                try {
                    request.get('/users/bob')
                        .accept('application.json')
                        // ??? 
                        .expect(404)
                        .end((e, r) => {
                            if (e) {
                                resolve(e);
                                return;
                            }
                            resolve({});
                        });
                } catch (e) {
                    reject(e)
                }
            })
        });

        it('put/add/new', async () => {
            await new Promise((resolve, reject) => {
                request.put('/users/')
                    .accept('application.json')
                    .send({ name: "bob", password: "bob" })
                    .expect(200)
                    //.expect('{"name":"bob","password":"bob"}')
                    .end((e, r) => {
                        if (e) {
                            reject(e)
                            return;
                        }
                        resolve(r);
                    });
            })
        });

        it('post/set/modify', async () => {
            let user = { name: 'bob', password: 'bob' };
            await userService.add(user);
            await new Promise((resolve, reject) => {
                request.post('/users')
                    .accept('application.json')
                    .send({ name: "bob", password: "bob" })
                    .expect(200)
                    //.expect('{"name":"bob","password":"bob"}')
                    .end((e, r) => {
                        if (e) {
                            reject(e)
                            return;
                        }
                        resolve(r);
                    });
            })
        });

        it('delete/remove', async () => {
            let user = { name: 'bob', password: 'bob' };
            await userService.add(user);
            await new Promise((resolve, reject) => {
                request.del('/users/bob')
                    .accept('application.json')
                    .expect(200)
                    .end((e, r) => {
                        if (e) {
                            reject(e)
                            return;
                        }
                        resolve(r);
                    });
            })
        })
    })    

});


function isError(e: any): e is Error {
    return e instanceof Error
}