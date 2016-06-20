import * as Koa from 'koa';
import {assert} from 'chai';
import {app} from './index';
import * as supertest from 'supertest';
import {Users} from './users/service';
import * as users from './users/users';

var request = supertest.agent(app.listen());

describe('Hello World', function () {
    it('should say "Hello"', (done) => {
        request
            .get('/')
            .expect(200)
            .expect('Hello', done);
    });
});

describe('Users route', () => {

    beforeEach(async () => {
        users.service = new Users();
    });

    describe('get', () => {

        it('get ok', async () => {

            let user = { name: 'bob' };
            await users.service.add(user);
            await new Promise((resolve, reject) => {
                request.get('/users/bob')
                    .accept('application.json')
                    .expect(200)
                    .expect('{"name":"bob"}')
                    .end((e, r) => {
                        if (e) {
                            reject(e)
                        }
                        resolve(r);
                    });
            })
        });

        it('Throws NotFound', async () => {

            let user = { name: 'bob' };
            
            let ex = await new Promise((resolve, reject) => {
               try{
                    request.get('/users/bob')
                    .accept('application.json')
                    .expect(200)
                    .expect('{"name":"bob"}')
                    .end((e, r) => {
                        if (e) {
                            resolve(e);
                            return;
                        }
                        resolve({});
                    });
               } catch(e) {
                   reject(e)
               }
            })
            assert.isTrue(isError(ex));
        });
    })

});

function isError(e:any) : e is Error {
    return e instanceof Error
}