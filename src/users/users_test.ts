import {Users} from './service'
import {assert} from 'chai';

import * as users from './users';

describe('users', ()=>{

    beforeEach(async ()=>{
        users.service = new Users();
    });

    it('add/get', async ()=> {
        let user  = {name: 'bob'};
        await users.service.add(user);        
        let got = await users.service.get('bob');                
        assert.deepEqual(user, got);                             
    });
})