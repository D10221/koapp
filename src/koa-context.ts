import * as users from './users';
import * as Koa from 'koa';

export interface Middleware {
    (ctx?: Koa.Context, next?: ()=> any) : Koa|any;
}

export interface Next {
  (...p:any[]) : any;
} 

export interface Request extends Koa.Request {
  user?: users.User;
}

export interface Context extends Koa.Context{
    request : Request; 
}
