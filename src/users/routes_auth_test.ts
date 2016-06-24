import {auth} from '../auth';
import * as Koa from 'koa';
import * as path from 'path';
import {assert} from 'chai';
import * as supertest from 'supertest';
import * as users from './';
import * as home from '../home';
import * as Router from 'koa-router';

describe('Authenticate', () => {

    let app = new Koa();

    var request = supertest.agent(app.listen());
    //  test path 
    users.storePath = path.join(
        // BasePath 
        process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
        'test.db'
    );

    let userStore = users.service.value;

    //Unsecured
    app.use(home.routes);
    //Auth
    app.use(auth(users.fromCredentials));
    //Secured
    app.use(users.router.routes());

    let testRouter = new Router();
    
    testRouter.get('/secret',
        (ctx, next) => {
            ctx.body = "ok";
        });

    testRouter.get('/super/secret',
        users.requiresRole('batman'),
        (ctx, next) => {
            ctx.body = "ok";
        });

     testRouter.get('/error', (ctx, next)=> {
         ctx.body = 'error';
     });

    app.use(testRouter.routes());    

   
    beforeEach(async () => {
        if (!userStore.has('admin')) {
            await users.addUser({
                name: 'admin',
                password: 'admin',
                email: 'admin@mail',
                roles: ['admin']
            });
        }
    })

    /**
     * '/' is registered before auth 
     */
    it('expects unsecured 200', async (done) => {
        let e = null;
        request.get('/').expect(200).end((err, res) => {
            if (err) throw err;
            done();
        });
    });

    //** secured 
    it('expects 401', async (done) => {
        let e = null;
        request.get('/secret').expect(401).end((err, res) => {
            if (err) throw err;
            done();
        });
    });

    //** secured 
    it('expects secured 200', async (done) => {
        let e = null;
        request.get('/secret')
            .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
            .expect(200).end((err, res) => {
                if (err) throw err;
                done();
            });
    });

    //** secured : only accesible to 'batman'
    it('expects secured to batman 403 forbidden', async (done) => {
        let e = null;
        request.get('/super/secret')
            .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
            .expect(403).end((err, res) => {
                if (err) throw err;
                done();
            });
    });


})

function delay(milisecond): Promise<any> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, milisecond);
    });
}