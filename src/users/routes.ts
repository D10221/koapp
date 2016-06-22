import * as Router from 'koa-router';
import * as users from './';
var parse = require('co-body');

export const router = new Router();

router.get('/users/:name', async (ctx, next) => {

  let user = await users.service.get(ctx.params.name)
    .catch(e => {
      if (e.code) {
        ctx.throw(e.code);
        return;
      }
      ctx.throw(e)
    });

  if (user) {
    ctx.body = user;
    return;
  }
  ctx.throw(404);

});

router.del('/users/:name', async (ctx, next) => {
  await users.service
    .remove({ name: ctx.params.name })
    .catch(e => {
      if (e.code) {
        ctx.throw(e.code);
        return;
      }
      ctx.throw(e)
    });

  ctx.body = 'ok';
});

router.put('/users/', async (ctx, next) => {

  let user = await parse(ctx);
  //if(!user) { ctx.throw(404)  }            
  await users.service.add(user)
    .catch(e => {
      if (e.code) {
        ctx.throw(e.code);
        return;
      }
      ctx.throw(e)
    });
  ctx.body = `ok`;
});

router.post('/users/', async (ctx, next) => {
  let user = await parse(ctx);
  if (!user) {
    ctx.throw(401);
  }

  await users.service.set(user)
    .catch(e => {
      if (e.code) {
        ctx.throw(e.code);
        return;
      }
      ctx.throw(e)
    });
  ctx.body = `ok`;
});