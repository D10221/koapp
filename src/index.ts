import * as Koa from 'koa';
import * as users from './users/users'
export const app = new Koa();

app.use(users.routes);

if (!module.parent) app.listen(3000);