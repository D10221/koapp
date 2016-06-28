import * as test from 'tape'
import * as auth from './';
import * as Koa from 'koa';
import * as supertest from 'supertest';
import SuperTest = supertest.SuperTest;
import * as tt from '../test/tools';

function listen(app) {
    return app.listen();
}

test.onFinish(e => {
    if (e) console.log(e.message);
    process.exit();
})

async function mWare(ctx, next) {
    ctx.body = (ctx.request as any).user 
        && (ctx.request as any).user.name  ?
         'user' : 'empty';
}

const getRequest = function (): SuperTest {
    let app = new Koa();
    app.use(auth.auth(tt.UserService.default.fromCredentials));
    app.use(mWare)
    return supertest(listen(app));
}

test('200', async (t) => {
    getRequest()
        .get('/')
        .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
        .expect(200)
        .expect('user')
        .end((e, r) => {
            t.assert(!e);
            if (e) console.log(e.message);
            t.end();
        });
})

test('401', async (t) => {
    getRequest()
        .get('/')
        //.set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
        .expect(401)
        .expect('Unauthorized')
        //.expect({name: 'admin', password: 'admin'})
        .end((e, r) => {
            t.assert(!e);
            if (e) console.log(e.message);
            t.end();
        });
})