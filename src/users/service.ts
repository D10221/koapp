import {User} from './User';

export class Users {
    
    _users = new Map<string, User>();

    constructor() {
        this._users = new Map<string, User>();
    }

    get(key: string): Promise<User> {
        return new Promise((resolve, reject) => {
            try {
                let user = this._users.get(key);
                if (user) {
                    resolve(user);
                    return;
                }
                reject(NotFound);
            } catch (e) {
                reject(e);
            }
        });
    }

    set(user: User): Promise<this> {

        return new Promise((resolve, reject) => {
            try {
                rejectEmpty(user);
                rejectEmpty(user.name);
                this._users.set(user.name, user);
                resolve(this);
            } catch (e) {
                reject(e);
            }
        });
    }

    remove(user: User): Promise<this> {
        return new Promise((resolve, reject) => {
            try {
                rejectEmpty(user);
                rejectEmpty(user.name);
                this._users.delete(user.name);
                resolve(this);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    add(user: User): Promise<this> {
        return new Promise((resolve, reject) => {
            try {
                rejectEmpty(user);
                rejectEmpty(user.name);
                rejectExists(this._users, user);
                this._users.set(user.name, user);
                resolve(this);
            } catch (e) {
                reject(e);
            }
        })
    }
}


function rejectEmpty(x: any) {
    if ('undefinde' == typeof x || null == x) {
        throw Empty;
    }
}

function rejectExists(users: Map<string, User>, user: User) {
    if (users.has(user.name)) {
        throw Exists;
    }
}

export const Empty = new Error('Null or Undefined');
export const NotFound = new Error('Not Found');
export const Exists = new Error('Exists');