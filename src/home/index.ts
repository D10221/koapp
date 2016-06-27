import * as Koa from 'koa';
import * as router from 'koa-route-ts';

export const routes : router.KoaMiddleware[] = [] ;

routes.push(
router.get('/',  async (ctx, next) => {
  ctx.body = await Promise.resolve('Hello');
})
);

