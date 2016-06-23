import * as Router from 'koa-router';
import * as users from './';
var parse = require('co-body');

export const router = new Router();

/***
 * get existing user
 */
router.get('/users/:name', async (ctx, next) => {
  try {

    let userService = users.service.value;
    let user = await userService.get(ctx.params.name);
    if (user) {
      ctx.body = user;
      return;
    }
    ctx.throw(404);

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e);
  }
});

/**
 * Remove User
 */
router.del('/users/:name', async (ctx, next) => {
  try {

    let userService = users.service.value;
    await userService
      .remove({ name: ctx.params.name });
    ctx.body = 'ok';

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e)
  }
});

/**
 * add new user
 */
router.put('/users/', async (ctx, next) => {
  try {

    let user = await parse(ctx);
    let userService = users.service.value;
    await userService.add(user)
    ctx.body = `ok`;

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e)
  }
});

/**
 * update existing user
 */
router.post('/users/', async (ctx, next) => {
  try {

    let user = await parse(ctx);
    if (!user) {
      ctx.throw(401);
    }
    let userService = users.service.value;
    await userService.set(user);

    ctx.body = `ok`;

  } catch (e) {
    if (e.code) {
      ctx.throw(e.code, e.message);
      return;
    }
    ctx.throw(e)
  }
});