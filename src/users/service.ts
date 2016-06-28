import * as crypt from '../crypto';
import * as path from 'path';
import {delay, isEmpty, isString} from '../util';
import {User} from './';

import * as syncedmap from  'syncedmap';

export interface iUserService {
    byName(string): Promise<User>;
    remove(u:User) : Promise<this>;
    add(u: User): Promise<this>
    set(user:User) : Promise<this>;
    clear():Promise<this>
    fromCredentials(name: string, pass: string): Promise<User>;
    timeOut:number;
    init():Promise<this>;
}

export let default_instance: iUserService = null;

export class UserService implements iUserService {

    static get default(): iUserService {
        return default_instance || new UserService();
    }

    _store: syncedmap.Service<User>;

    get store() {
        return this._store || (
            this._store = syncedmap.factory.create<User>(user => user.name, this.storePath)
        );
    }

    constructor(private storePath?: string) {
        storePath = storePath || path.join(
            // BasePath 
            process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(),
            'users.db'
        );
    }

    async init(){
        //...
        return this;
    }
    get timeOut() : number {
        return this.store.timeOut;
    }    
    set timeOut(value:number){
         this.store.timeOut = value;
    }
    clear(): Promise<this>{
        return this.store.clear().then(x=> this);
    }

    fromCredentials(name: string, pass: string): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                let user = await this.store.get(name)
                let ok = crypt.decrypt(user.password) == pass;
                resolve(ok ? user : null);
            } catch (e) {
                reject(e);
            }
        });
    }

    authenticate(user: User): Promise<User> {
        return this.byName(user.name).then(u => {
            let x = crypt.tryDecrypt(u.password);
            return x && x.replace(/\s+/, '') != '' && x == user.password ? user : null;
        })
    }

    byName(name: string): Promise<User> {
        if (!name) return Promise.resolve(null);
        return this.store.get(name);
    }

    add(u: User): Promise<this> {
        u.password = crypt.tryEncrypt(u.password);
        if (isEmpty(u.password)) throw PasswordEmpty;
        return this.store.add(u)
            .then(x=> this);
    }

    maskPassword(user: User): User {
        if (user) {
            user.password = "xxxxxxxx";
        }
        return user;
    }
    
    set(u:User) :Promise<this> {
        return this.store.set(u).then(x=> this);
    }

    encrypt(u: User): User {
        if (u) {
            u.password = crypt.tryEncrypt(u.password);
        }
        return u;
    }
    decrypt(u: User): User {
        if (u) {
            u.password = crypt.tryDecrypt(u.password);
        }
        return u;
    }
    
    hasRole(user: User, role: string): boolean {
        if (!user || !user.roles) return false;
        for (let xrole of user.roles) {
            if (role == xrole) {
                return true;
            }
        }
        return false;
    }
    
    isAdmin(user: User): boolean {
        return this.hasRole(user, 'admin');
    }

    remove(u:User) : Promise<this>{
        return this.store.remove(u).then(x=> this);
    }
}

export const service = new UserService();

export const PasswordEmpty = new Error('empty password');
