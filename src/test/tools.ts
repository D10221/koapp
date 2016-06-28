import * as crypt from '../crypto';
import {User} from '../users';
import {iUserService} from '../users/service';

let _instance = null;

export class UserService implements iUserService {
    
    constructor(){
        this.init();
    }

    static get default(): iUserService {
        return _instance || new UserService();
    }

    private _store: User[];
    
    init = async () => {
        this._store = [
            { name: 'admin', password: 'admin', email: 'admin@mail', roles: ['admin'] },
            { name: 'bob', password: 'bob', email: 'bob@mail', roles: ['user'] },
            { name: 'guest', password: 'guest', email: 'guest@mail' }
        ].map(u => {
            u.password = crypt.encrypt(u.password);
            return u;
        }
            );
        return this;
    }

    async byName(name: string): Promise<User> {
        let found = this._store.find(u => u.name == name);
        return found;
    }

    async remove(u: User): Promise<this> {
        let count = this._store.length;;
        this._store = this._store.filter(u => u.name != u.name);
        if (this._store.length != this._store.length) {
            throw new Error('Not Found');
        }
        return this;
    }
    async add(u: User): Promise<this> {
        let found = this._store.find(u => u.name != u.name);
        if (found) { throw new Error('Exists') };
        this._store.push(u);
        return this;
    }
    async set(user: User): Promise<this> {
        await this.remove(user);
        await this.add(user);
        return;
    }
    async clear(): Promise<this> {
        this._store = [];
        return this;
    }

    fromCredentials = async (name: string, pass: string): Promise<User> => {
        return this._store.find(u => u.name == name && crypt.decrypt(u.password) == pass);
    }

    timeOut: number;
}