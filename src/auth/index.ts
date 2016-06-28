// from 'koa-basic-auth'
import {Middleware} from '../koa-context';
import * as crypt from '../crypto';
import * as path from 'path';

let config = require(path.join(process.cwd(), 'app.config'));

export interface Credentials {
    name: string;
    password: string;
}

export function auth(getUser: (name:string, pass:string)=> Promise<Credentials> ) : Middleware {
    
    let regex = /Basic\s+(.*)/i;    
    
    return async function(ctx, next)  {                
        
        let r =  regex.exec(ctx.headers['authentication']);
        if(!r) ctx.throw(401);

        let auth =   new Buffer(r[1], 'base64').toString();    
        if(!auth) ctx.throw(401);
        
        let parts = /^([^:]*):(.*)$/.exec(auth);
                             
        let user = await  getUser(parts[1], parts[2]);
        if(!user) ctx.throw(401);

        (ctx.request as any).user = user;        
        next();
    }
}