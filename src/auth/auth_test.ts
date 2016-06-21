import * as auth from './';
import * as Koa from 'koa'; 
import * as st from 'supertest';

describe('auth', ()=> {
    
    it('200',async ()=>{
        let app = new Koa();
        let getUser = (name,pass)=> { return { name: name , password: pass } };
        app.use(auth.auth(getUser));        
        app.use((ctx,next)=>{
            ctx.body = (ctx as any).user;
        })
        let request = st(app.listen());
        await new Promise((resolve,reject)=>{
            request
            .get('/')
            .set('Authentication', `Basic ${new Buffer('admin:admin').toString('Base64')}`)
            .expect(200)            
            .expect({name: 'admin', password: 'admin'})
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
        app.use(auth.auth((name,pass)=> {            
            return {
                name: name , password: pass 
            }
        }));
        app.use((ctx,next)=>{
            ctx.body = (ctx as any).user;
        })
        let request = st(app.listen());
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