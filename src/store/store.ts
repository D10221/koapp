import {Chain} from 'chain';
import * as encoder from 'map-encoder';
import * as fs from 'fs';
import {KeyValue} from '../common';
import * as Rx from 'rx';


export type TKey = number | string | symbol;

export function isKey(x): x is TKey {
    return 'string' == typeof (x) || 'number' == typeof x || 'symbol' == typeof x;
}

type Action = 'set' | 'add' | 'remove' | 'clean' | 'get';

export type ChangeAction = 'set' | 'add' | 'remove' | 'clear';

export function isChange(key: string): key is ChangeAction {
    for (let eKey of ['set', 'add', 'remove', 'clear']) {
        if (key == eKey) {
            return true;
        }
    }
    return false;
}

export type StoreEvent = 'add' | 'remove' | 'clear' | 'set';

function getStore<TKey, TValue>(storePath: string): Map<TKey, TValue> {
    return fs.existsSync(storePath) ? encoder.deserializeFromFileSync<TKey, TValue>(storePath) : null
}

export class Service<TValue> {

    /** Static Factory */
    static create<TValue>(
        key: (x: TValue) => TKey, storePath: string

    ): Service<TValue> {

        let service = new Service(key, getStore<TKey, TValue>(storePath));

        let persist = Rx.Observer.create<Service<TValue>>(

            /* onNext:*/ async (s) => {
                await encoder.serializeToFile(storePath, s._values).catch(e => {
                    service.publish('save', e);
                });
                service.publish('save', true);
            },
            /*onError: */ e => {
                console.log(e);
            },
            /* onCompleted: */() => {
                console.log('Service: Events : Completed? ')
            })

        service.onChange(persist);

        return service;
    }

    constructor(private getKey: (x: TValue) => TKey, map?: Map<TKey, TValue>) {
        this._values = map || new Map<TKey, TValue>();
    }

    _values = new Map<TKey, TValue>();

    _events = new Rx.Subject<KeyValue>();

    get events(): Rx.Observable<KeyValue> { return this._events.asObservable(); }

    getEvent(event: StoreEvent): Rx.Observable<any> {
        return this.events.where(e => e.key == event).select(e => e.value);
    }

    publish(key: string, value: any) {
        this._events.onNext({ key: key, value: value });
    }

    get(key: TKey): Promise<TValue> {
        return new Promise((resolve, reject) => {
            try {
                let user = this._values.get(key);
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

    set(value: TValue | TValue[]): Promise<this> {
         return this.addSetRemove('set', value, this) ;        
    }

    remove(value: TValue | TValue[]): Promise<this> {
         return this.addSetRemove('remove', value, this) ; 
    }

    add(value: TValue | TValue[]): Promise<this> {
        return this.addSetRemove('add', value, this) ; 
    }

    private validate(action: Action, key: TKey, value: TValue) {

        if (action == 'add') {
            rejectEmpty(value);
            rejectEmpty(key);
            rejectExists(this, value);
            return;
        }

        if (action == 'set') {
            rejectEmpty(value);
            rejectEmpty(key);
            rejectNotFound(this, value);
            return;
        }

        if (action == 'remove') {
            rejectEmpty(value);
            rejectEmpty(key);
            rejectNotFound(this, value);
            return;
        }
    }
    
    private internally(action: Action, value: TValue) {
        let key = this.getKey(value);
        this.validate(action, key, value);
        if (action == 'add' || action == 'set') {
            this._values.set(key, value);
            return;
        }
        if (action == 'remove') {
            this._values.delete(key);
            return;
        }
    }    

    private addSetRemove<TReturn>(action:Action, value: TValue | TValue[], ret: TReturn) : Promise<TReturn> {
        
        return new Promise((resolve, reject) => {

            try {

                value = Array.isArray(value) ? value : [value];

                let changed = false;
                (value as TValue[]).forEach(item => {
                    changed = true;
                    this.internally(action, item);
                });

                if (changed) {
                    this.publish(action, value);
                    this.onSave()
                    .subscribe(e => { 
                        if (isError(e)) { reject(e); return; } resolve(ret); }
                        ,e => reject(e));
                };

            } catch (e) {
                reject(e);
            }
        })
    }
    onSave(): Rx.Observable<any> {
        return this.events
            .where(e => e.key == 'save')
            .take(1)
            .timeout(this.timeOut);
    }

    timeOut: number = 1000;

    clear(): Promise<this> {
        this._values.clear();
        this.publish('clear', this);
        return Promise.resolve(this);
    }

    has(valueOrKey: TValue | TKey): boolean {
        return isKey(valueOrKey) ? this._values.has(valueOrKey as TKey) : this._values.has(this.getKey(valueOrKey as TValue));
    }

    onChange(observer: Rx.Observer<any>): Rx.Disposable {
        return this.getEvent('add')
            .merge(this.getEvent('set'))
            .merge(this.getEvent('remove'))
            .merge(this.getEvent('clear'))
            .select(x => this)
            .subscribe(observer);
    }

    get query(): Chain<TValue> { return new Chain(this._values.values()) }

    get size() { return this._values.size }
}

function timeout(ok: Rx.Observable<any>, timeOut: number): Promise<boolean> {

    return new Promise((resolve, reject) => {

        let timer = setTimeout(() => {
            resolve(false)
        }, timeOut)

        ok.take(1)
            .subscribe(e => {
                timer.unref();
                resolve(true)
            },
        /* onError */(e) => {
                timer.unref();
                reject(e);
            })
    })
}
function rejectEmpty(x: any) {
    if ('undefined' == typeof x || null == x) {
        throw Empty;
    }
}

function rejectExists<TValue>(svc: Service<TValue>, valueOrKey: TValue | TKey) {
    if (svc.has(valueOrKey)) {
        throw Exists;
    }
}

function rejectNotFound<TValue>(svc: Service<TValue>, valueOrKey: TValue | TKey) {
    if (!svc.has(valueOrKey)) {
        throw NotFound;
    }
}

export class StoreError extends Error {
    constructor(message, private code) {
        super(message);

    }
}

export const Empty = new StoreError('Null or Undefined', 400);
export const NotFound = new StoreError('Not Found', 404);
export const Exists = new StoreError('Exists', 409);


function isError(e): e is Error {
    let t = 'error' == typeof e;
    let i = e instanceof Error;
    return i || t;
}
function isFunction(x): x is Function {
    return 'function' == typeof (x);
}
function isIterator(x): x is IterableIterator<any> {
    return x && isFunction(x.next);
}