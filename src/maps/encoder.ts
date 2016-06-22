import * as fs from 'fs';

export interface Collection<T> {

}

export interface Indexer<T extends string|number|symbol> extends Collection<T> {
    [index: string]: T;
}

export function isMap(x:any) : x is Map<any,any>{
    return x instanceof Map
}

export function toObject(map: Map<any,any>): Object {

    var o :any = Object.create(null);

    for(let [k, v] of map.entries()) {
        o[k] = isMap(v) ? toObject(v): v;
    }
    return o;
}

export function isObject(x:any){
    return typeof x == 'object';
}

export function toMap<TKey>(obj:Indexer<any>) : Map<TKey,any>{
    let strMap = new Map<TKey,any>();
    for (let k of Object.keys(obj)) {
        var value = obj[k];
        strMap.set(k as any, isObject(value) ? toMap(value) : value );
    }
    return strMap;
}

export function serializeMapSync<K,V>(map : Map<K,V>) : string {
    return JSON.stringify(toObject(map));
}

function serializeMapAsync<TKey,TValue>(map:Map<TKey,TValue>):Promise<string> {
    return new Promise((resolve, reject)=> {
        try {
            resolve(serializeMapSync(map))
        } catch (e) {
            reject(e);
        }
    })
}


export function serializeToFile<K,V>(filePath: string, map : Map<K,V>) : void {
     fs.writeFileSync(
        filePath,
        JSON.stringify(toObject(map))
    );
}

export function deserialize<K,V>(json :string) :  Map<K,V> {
    return toMap<K>(JSON.parse(json));
}

export function deserializeFromFileSync<K,V>(filePath:string) :  Map<K,V> {
    toMap(JSON.parse(fs.readFileSync(filePath, 'utf-8')));
    return
}

export function deserializeFromFile<K,V>(filePath:string) :  Promise<Map<K,V>> {
        
    return new Promise((rs,rj)=>{
            fs.readFile(filePath, 'utf-8', (err, data)=>{
                if(err){
                    rj(err);
                }
                var x = toMap(JSON.parse(data));
                rs(x);
            });
        })
}



export function toMaps<T,TKey>(key: (target:T) => TKey, targets:T[]) : Map<TKey,Map<string, any>> {

    var map = new Map<TKey,Map<string,any>>();

    targets.forEach(target=> {

        map.set(key(target), toMap<string>(target));
    });

    return map ;
}

export function fromMap<T,TKey>(type: { new(): T ;} , map: Map<TKey, any>){

    var target  = new type();

    // value: V, index: K, map: Map<K, V>
    map.forEach(( v : any , k: TKey )=> {
        (target as any)[k as any] = v
    });

    return target;

}


export function fromMaps<T,TKey>(type: { new(): T ;} , maps:IterableIterator<Map<TKey,any>>) : T[] {

    var result :T[] = [] ;

    for(var map of maps){

        result.push(fromMap(type, map))
    }
    return result;
}