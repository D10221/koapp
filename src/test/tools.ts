import * as crypt from '../crypto';
import {User} from '../users';
import {iUserService} from '../users/service';

export let _store : User[] = [
    {name: 'admin', password: 'admin', email: 'admin@mail', roles: ['admin']},
    {name: 'bob', password: 'bob', email: 'bob@mail', roles: ['user']},
    {name: 'guest', password: 'guest', email: 'guest@mail'}
].map(u=> {
    u.password = crypt.encrypt(u.password);
    return u;
})

let _instance = null;

export class UserService implements iUserService {
    
    static get default(): iUserService {
        return _instance || new UserService();
    }

    async byName(name:string): Promise<User> {
        return _store.find(u=> u.name == name);
    }

    async remove(u: User): Promise<this> {
        let count = _store.length;;
        _store = _store.filter(u=> u.name != u.name);
        if(_store.length != _store.length) {
            throw new Error('Not Found');
        }
        return this;
    }
    async add(u: User): Promise<this> {
        let found = _store.find(u=> u.name != u.name);
        if(found){ throw new Error('Exists')};
        _store.push(u);
        return this;        
    }
    async set(user: User): Promise<this> {
        await this.remove(user);
        await this.add(user);
        return;
    }
    async clear(): Promise<this> {
        _store = [];
        return this;
    }

    async fromCredentials(name: string, pass: string): Promise<User> {
        return _store.find(u=> u.name == name && crypt.decrypt(u.password) == pass);
    }

    timeOut: number;
}