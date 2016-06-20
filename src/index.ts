import * as Koa from 'koa';
import * as users from './users/';
import * as home from './home';

export const app = new Koa();

app.use(users.routes);
app.use(home.routes);

if (!module.parent){
    app.listen(process.env.PORT || '3000');
}  
