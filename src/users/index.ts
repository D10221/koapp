import * as Koa from 'koa';
import {Lazy} from 'lazyt'
import * as router from 'koa-route-ts';
import { iUserService ,UserService} from './service';
import {delay, isEmpty, isString} from '../util';

var parse = require('co-body');

export const UnAuthorized = new Error('unauthorized');

export interface User {
    name?: string;
    email?: string;
    password?: string;
    roles?: string[];
}

export let service:iUserService  = UserService.default;

/**
 * ROUTES
 **/
export const routes = {
    /***
     * get existing user
     */
    get: router.get('/users/:name', async function (name, next) {
        let ctx: Koa.Context = this;
        try {
            let user = await service.byName(name); // .then(maskPassword);
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
    }),
    /**
     * delete user 
     */
    del: router.del('/users/:name', async function (name, next) {
        let ctx: Koa.Context = this;
        
        try {
            await service
                .remove({ name: name });
            ctx.body = 'ok';

        } catch (e) {
            if (e.code) {
                ctx.throw(e.code, e.message);
                return;
            }
            ctx.throw(e)
        }
    }),
    /**
    * add new user
     */
    put: router.put('/users', async function (name, next) {
        let ctx: Koa.Context = this;
        try {

            let user = await parse(ctx);
            await service.add(user);
            ctx.body = `ok`;

        } catch (e) {
            if (e.code) {
                ctx.throw(e.code, e.message);
                return;
            }
            ctx.throw(e)
        }
    }),
    /**
    * update existing user
    */
    set: router.post('/users', async function (nothing, next) {
        let ctx: Koa.Context = this;
        try {
            let user = await parse(ctx);
            if (!user) {
                ctx.throw(401);
            }
            await service.set(user);
            ctx.body = `ok`;
        } catch (e) {
            if (e.code) {
                ctx.throw(e.code, e.message);
                return;
            }
            ctx.throw(e)
        }
        return this;
    })
}
