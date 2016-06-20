import {assert} from 'chai';
import  * as crypt from './'

describe('crypt',()=>{
    
    it('works',()=>{
        assert.equal(crypt.decrypt(crypt.encrypt('hello')), 'hello');
    })   
})