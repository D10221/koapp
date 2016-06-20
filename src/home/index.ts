import * as Router from 'koa-router';

let router = new Router();

router.get('/',  async (ctx, next) => {
  ctx.body = await Promise.resolve('Hello');
});

export const routes = router.routes() ;
