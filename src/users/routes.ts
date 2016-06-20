import * as Router from 'koa-router';
import * as users from './users';

export const router = new Router();

router.get('/users/:name', async (ctx,next)=>{    
    ctx.body = await users.service.get(ctx.params.name);
});

router.delete('/users/:name', async (ctx,next)=>{
  await users.service.remove({ name: ctx.params.name });
  ctx.body = 'ok';
});

router.put('/users/:name', async (ctx,next)=>{    
  await users.service.add({ name: ctx.params.name });
  ctx.body = `hello ${ctx.params.name}`;
});

router.post('/users/:name', async (ctx,next)=>{    
  await users.service.set({ name: ctx.params.name });
  ctx.body = `hello ${ctx.params.name}`;
});

router.get('/',  async (ctx, next) => {
  ctx.body = await Promise.resolve('Hello');
});