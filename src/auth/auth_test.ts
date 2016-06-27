import * as auth from './';
import * as Koa from 'koa'; 
import * as st from 'supertest';
function listen(app){
    return app.listen();
}
describe('auth', ()=> {
    
    it('200',async ()=>{
        let app = new Koa();
        let getUser = (name,pass)=> { return { name: name , password: pass } };
        app.use(auth.auth(getUser));        
        app.use((ctx,next)=>{
            ctx.body = (ctx.request as any).user ? 'success' : null;            
        })
        let request = st(listen(app));
        await new Promise((resolve,reject)=>{
            request
            .get('/')
            .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
            .expect(200)            
            .expect('success')
            .end((e,r)=>{
                if(e){
                    reject(e);
                    return ;
                }
                resolve(r);
            });

        })
    })

    it('401',async ()=>{
        let app = new Koa();
        //auth:
        app.use(auth.auth((name,pass)=> {            
            return {
                name: name , password: pass 
            }
        }));
        //route: shoud bot be hit
        app.use((ctx,next)=>{
            throw('Should not reach this point');
            //ctx.body = (ctx.request as any).user;
        })
        let request = st(listen(app));
        await new Promise((resolve,reject)=>{
            request
            .get('/')
            //.set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
            .expect(401)            
            //.expect({name: 'admin', password: 'admin'})
            .end((e,r)=>{
                if(e){
                    reject(e);
                    return ;
                }
                resolve(r);
            });

        })
    })
})