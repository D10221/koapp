import * as Koa from 'koa';

export interface Middleware {
    (ctx?: Koa.Context, next?: ()=> any) : Koa|any;
}