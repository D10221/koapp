import * as fs from 'fs';
import * as crypt from '../crypto';
import {KeyValue} from '../common';
import * as Rx from 'rx';
import {User} from './User';
import * as encoder from '../maps/encoder'

function getStore(storePath: string): Map<string, User> {

    return fs.existsSync(storePath) ? encoder.DeserializeFromFileSync<string, User>(storePath) : null
}

function modifiedKey(key:string) : boolean {
    for(let eKey of ['set', 'add', 'remove', 'clear']){
        if(key ==eKey){
            return true;
        }
    }
    return false;
}

let subscription : Rx.Disposable = null ;

export function getService(storePath: string): Users {

    let service = new Users(getStore(storePath));

    if(subscription) subscription.dispose();
    subscription = service.events
    .where(e => modifiedKey(e.key))
        .subscribe(e => {
            encoder.SerializeToFile(storePath, service._users)
        })

    return service;
}

export class Users {

    constructor(map?: Map<string, User>) {
        this._users = map || new Map<string, User>();
    }

    _users = new Map<string, User>();

    _events = new Rx.Subject<KeyValue>();

    get events(): Rx.Observable<KeyValue> { return this._events.asObservable(); }

    publish(key: string, value: any) {
        this._events.onNext({ key: key, value: value });
    }

    get(key: string): Promise<User> {
        return new Promise((resolve, reject) => {
            try {
                let user = this._users.get(key);
                if (user) {

                    let result = crypt.tryeDecrypt(user.password);
                    if (result.error) {
                        reject(result.error);
                        return;
                    };

                    user.password = result.value;
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
                rejectNotFound(this._users, user);

                let result = crypt.tryEncrypt(user.password);
                if (result.error) { reject(result.error); return; }
                user.password = result.value;

                this._users.set(user.name, user);
                this.publish('set', user);
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
                rejectNotFound(this._users,user);
                this._users.delete(user.name);
                this.publish('remove', user);
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

                let result = crypt.tryEncrypt(user.password);
                if (result.error) { reject(result.error); return; }
                user.password = result.value;

                this._users.set(user.name, user);
                this.publish('add', user);
                resolve(this);
            } catch (e) {
                reject(e);
            }
        })
    }

    clear(): Promise<this> {
        this._users.clear();
        this.publish('clear', this);
        return Promise.resolve(this);
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

function rejectNotFound(users: Map<string, User>, user: User) {
    if (!users.has(user.name)) {
        throw NotFound;
    }
}

export const Empty = new Error('Null or Undefined');
export const NotFound = new Error('Not Found');
export const Exists = new Error('Exists');