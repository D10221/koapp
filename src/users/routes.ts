import * as Router from 'koa-router';
import * as users from './';
var parse = require('co-body');

export const router = new Router();

router.get('/users/:name', async (ctx,next)=>{    
    ctx.body = await users.service.get(ctx.params.name);
});

router.del('/users/:name', async (ctx,next)=>{
  await users.service.remove({ name: ctx.params.name });
  ctx.body = 'ok';
});

router.put('/users/', async (ctx,next)=>{
  let user = await parse(ctx);        
  await users.service.add(user);
  ctx.body = `ok`;
});

router.post('/users/', async (ctx,next)=>{
  let user = await parse(ctx);    
  await users.service.set(user);
  ctx.body = `ok`;
});