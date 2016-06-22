
import {assert} from 'chai';
import * as Rx from 'rx';
import * as path from 'path';
import * as crypt from '../crypto';
import * as fs from 'fs';
import * as encoder from 'map-encoder';
import {Service} from './store';

function generate<T>(from:number, to:Number, fty:(n:number)=> T){
    let out = new Array();
    for(let i = from ; i <= to ; i++){
        out.push(fty(i));
    }
    return out;
}

const storePath = path.join(process.cwd(), 'users.db');

describe('store', () => {
    
    beforeEach(()=>{
        // 
    });

    it('add/set/remove => sync to file', async () => {
        
        this.timeout = 2500;

        let service = Service.create<User>( user=> user.name , storePath);
        //service.timeOut = 1500;
               
        service.clear();
        const max  = 100000 ; 
        await service.add(generate(0, max, n=> {
            let x = n.toString();
             return { name: x, email: x, password: x, roles: ['user']}
            }))
        
        let remove = service.query.where(user=> Number.parseInt(user.name) > 10 ).toArray();
        await service.remove(remove);
        assert.equal(service.size, 11); 

        console.log('OK');
    })
})

interface User {
    name?: string;
    email?: string;
    password?: string;
    roles?: string[];
}

