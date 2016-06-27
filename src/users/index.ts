import * as Koa from 'koa';
import * as K from '../koa-context';
import * as path from 'path';
import {Lazy} from 'lazyt'
import * as syncedmap from  'syncedmap';
import * as crypt from '../crypto';
import * as router from 'koa-route-ts';
import * as users from './';
var parse = require('co-body');


export let storePath = path.join(
    // BasePath 
    process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
    'users.db'
);

export const service = new Lazy<syncedmap.Service<User>>(() => {
    return syncedmap.factory.create<User>(user => user.name, storePath)
});


export function fromCredentials(name: string, pass: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await service.value.get(name)
            let ok = crypt.decrypt(user.password) == pass;
            resolve(ok ? user : null);
        } catch (e) {
            reject(e);
        }
    });
}


export function authenticate(user: User): Promise<User> {
    return byName(user.name).then(u => {
        let x = crypt.tryDecrypt(u.password);
        return x && x.replace(/\s+/, '') != '' && x == user.password ? user : null;
    })
}

export function byName(name: string): Promise<User> {
    if (!name) return Promise.resolve(null);
    return service.value.get(name).then(user => {
        return user;
    });
}

function isString(x): x is string {
    return 'string' == typeof (x);
}

function isEmpty(x) {
    if (isString(x)) {
        return x.replace(/\s+/, '') == ''
    };
    return x != 0 && x != null && 'undefined' != typeof x;
}

export const UnAuthorized = new Error('unauthorized');

export const PasswordEmpty = new Error('empty password');

// export  function requiresRole(role: string): Router.IMiddleware {
//   return async function(ctx,next){
//       const request =  (ctx.request as any);
//       let user = await request.user;
//       if(!hasRole(user, role)){
//           ctx.body = 'forbidden'                
//           ctx.status = 403;                    
//           return;
//       }
//       next();
//   }
// }

export interface User {
    name?: string;
    email?: string;
    password?: string;
    roles?: string[];
}

export function addUser(u: User): Promise<any> {
    u.password = crypt.tryEncrypt(u.password);
    if (isEmpty(u.password)) throw PasswordEmpty;
    return service.value.add(u);
}


export function maskPassword(user: User): User {
    if (user) {
        user.password = "xxxxxxxx";
    }
    return user;
}

export function encrypt(u: User): User {
    if (u) {
        u.password = crypt.tryEncrypt(u.password);
    }
    return u;
}

export function decrypt(u: User): User {
    if (u) {
        u.password = crypt.tryDecrypt(u.password);
    }
    return u;
}

export function hasRole(user: User, role: string): boolean {
    if (!user || !user.roles) return false;
    for (let xrole of user.roles) {
        if (role == xrole) {
            return true;
        }
    }
    return false;
}

export function isAdmin(user: User): boolean {
    return hasRole(user, 'admin');
}

/**************************
 *         ROUTES         *
 **************************/
export const routes: router.KoaMiddleware[] = [];

routes.push(
    /***
     * get existing user
     */
    router.get('/users/:name', async function (name, next){

        let ctx: Koa.Context = this;

        try {
            let user = await users.byName(name).then(maskPassword);
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
    })
);

routes.push(
/**
 * Remove User
 */
router.del('/users/:name', async function (name, next) {
    let ctx: Koa.Context = this;

    try {

        let userService = users.service.value;
        await userService
            .remove({ name: name });
        ctx.body = 'ok';

    } catch (e) {
        if (e.code) {
            ctx.throw(e.code, e.message);
            return;
        }
        ctx.throw(e)
    }
}));

routes.push(
/**
 * add new user
 */
router.put('/users', async function (name, next){
    let ctx: Koa.Context = this;
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
    return this;    
}));

routes.push(
/**
 * update existing user
 */
router.post('/users', async function (nothing, next){
    let ctx: Koa.Context = this;
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
    return this;
}));



