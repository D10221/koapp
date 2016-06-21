import * as Koa from 'koa';
import * as users from './users/';
import * as home from './home';
import {auth} from './auth';
var bodyParser = require('koa-bodyparser');

export const app = new Koa();

//it doesn't work 
//app.use(bodyParser());

//Auth
//app.use(auth(getUser));

app.use(users.routes);
app.use(home.routes);


if (!module.parent){
    app.listen(process.env.PORT || '3000');
}  
