import {assert} from 'chai';
import {app} from '../index';
import * as supertest from 'supertest';
import * as users from './';

var request = supertest.agent(app.listen());

describe('Users route', () => {

    beforeEach(async () => {
        await users.service.clear();
    });

    describe('get', () => {

        it('get ok', async () => {

            let user = { name: 'bob', password: 'bob' };
            await users.service.add(user);
            await new Promise((resolve, reject) => {
                request.get('/users/bob')
                    .accept('application.json')
                    .expect(200)
                    .expect('{"name":"bob","password":"bob"}')
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

        it('put/add/new',async ()=>{
            await new Promise((resolve, reject) => {
                request.put('/users/')
                    .accept('application.json')
                    .send({name:"bob",password:"bob"})
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

        it('post/set/modify',async ()=>{
            let user = { name: 'bob', password: 'bob' };
            await users.service.add(user);
            await new Promise((resolve, reject) => {
                request.post('/users')
                    .accept('application.json')
                    .send({name:"bob",password:"bob"})
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

        it('delete/remove',async ()=>{
            let user = { name: 'bob', password: 'bob' };
            await users.service.add(user);
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