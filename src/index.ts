import * as Koa from 'koa';
import * as users from './users/';
import * as home from './home';

var bodyParser = require('koa-bodyparser');

export const app = new Koa();

//it doesn't work 
//app.use(bodyParser());
app.use(users.routes);
app.use(home.routes);


if (!module.parent){
    app.listen(process.env.PORT || '3000');
}  
