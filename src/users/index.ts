import * as K from '../koa-context';
import * as path from 'path';
import {Lazy} from 'lazyt'
import * as syncedmap from  'syncedmap';
import * as crypt from '../crypto';
import * as Router from 'koa-router';
import * as users from './';
var parse = require('co-body');

export let storePath = path.join(
    // BasePath 
    process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(), 
    'users.db'
    );

export let service = new Lazy<syncedmap.Service<User>>(()=>{
    return syncedmap.factory.create<User>( user=> user.name , storePath)
});

export function authenticate(user: User): Promise<User> {
    return byName(user.name).then(u=> {
        let x = crypt.tryeDecrypt(u.password);
        return x && x.replace(/\s+/,'') != ''  && x == user.password ? user : null ;
    })    
}

export function byName(name:string) :Promise<User>{
    if(!name) return Promise.resolve(null);          
    return service.value.get(name).then(user=> {
        return user;
    });
}

function isString(x) : x is string{
    return 'string' == typeof(x);
}

function isEmpty(x){
    if(isString(x)) { 
        return  x.replace(/\s+/, '') == '' 
    };
    return x!= 0 && x!= null && 'undefined' != typeof x;
}

export const AnAuthorized =  new Error('unauthorized');

export const PasswordEmpty = new Error('empty password');

export function requiresRole(role: string): Router.IMiddleware {
  return (ctx,next)=> {
      let user = (ctx.request as any).user;
      if(!hasRole(user, role)){
          ctx.app.context.throw(401);
          return ;
      }
      next();
  }
}

export interface User {
    name?: string;
    email?: string;
    password?: string;
    roles?: string[];
}

export function addUser(u:User){
    u.password = crypt.tryEncrypt(u.password);
    if(isEmpty(u.password)) throw PasswordEmpty;
    service.value.set(u);
}


export function maskPassword(user:User) : User {
    if(user){
        user.password = "xxxxxxxx";        
    }
    return user;
}

export function encrypt(u:User) : User {
    if(u){
        u.password = crypt.tryEncrypt(u.password) ;
    }
    return u ; 
}

export function decrypt(u:User): User {
    if(u){
        u.password = crypt.tryeDecrypt(u.password);
    }
    return u;
}

export function hasRole(user:User, role: string) : boolean {
    if(!user) return false ;
    for(let xrole of user.roles){
        if(role == xrole) {
            return true;
        }        
    }
    return false;
}

export function isAdmin(user:User):boolean  {
    return hasRole(user, 'admin');
}

/**************************
 *          ROUTES
 ***************************/
export const router = new Router();

/***
 * get existing user
 */
router.get('/users/:name', async (ctx, next) => {
  try {        
    
    let user = await users.byName(ctx.params.name).then(maskPassword);
    if (user) {
      ctx.body = user;
      return;
    }
    ctx.throw(404);

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e);
  }
});

/**
 * Remove User
 */
router.del('/users/:name', async (ctx, next) => {
  try {

    let userService = users.service.value;
    await userService
      .remove({ name: ctx.params.name });
    ctx.body = 'ok';

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e)
  }
});

/**
 * add new user
 */
router.put('/users/', async (ctx, next) => {
  try {

    let user = await parse(ctx);
    let userService = users.service.value;
    await userService.add(user)
    ctx.body = `ok`;

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e)
  }
});

/**
 * update existing user
 */
router.post('/users/', async (ctx, next) => {
  try {

    let user = await parse(ctx);
    if (!user) {
      ctx.throw(401);
    }
    
    let userService = users.service.value;
    await userService.set(user);

    ctx.body = `ok`;

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e)
  }
});


/**
 * Validated user ? 
 */
export function fromCredentials(name: string, pass: string) : Promise<User> {
    return new Promise(async (resolve, reject)=>{
        try{
            let user = await service.value.get(name)
            let ok = crypt.decrypt(user.name) == pass;
            resolve(ok ? user: null );
        } catch(e){
            reject(e);
        }
    });
}


