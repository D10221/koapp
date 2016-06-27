import * as Koa from 'koa';
import * as users from './users/';
import * as home from './home';
import {auth} from './auth';
var bodyParser = require('koa-bodyparser');

export const app = new Koa();

//it doesn't work 
//app.use(bodyParser());

//Auth:  needs a func to ge a user from credentials 
app.use(auth(users.fromCredentials));

users.routes
    .forEach(route=> 
        app.use(route));

home.routes.forEach(route => app.use(route));

if (!module.parent){
    process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
    app.listen(process.env.KOA_PORT || '3000');
}  
