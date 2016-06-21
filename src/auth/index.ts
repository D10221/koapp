import {Middleware} from '../typings';
import * as crypt from '../crypto';
import * as path from 'path';

let config = require(path.join(process.cwd(), 'app.config'));


export function auth(getUser: (name:string, pass:string)=> any ) : Middleware {
    
    let regex = /Basic\s+(.*)/i;    
    
    return async function(ctx, next)  {                
        let r =  regex.exec(ctx.headers['authentication']);
        if(!r) throw(401);

        let auth =   new Buffer(r[1], 'base64').toString();    
        if(!auth) throw(401);
        
        let parts = /^([^:]*):(.*)$/.exec(auth);
        if(auth){                                    
            (ctx as any).user = getUser(parts[1], parts[2])
        }
        next();
    }
}