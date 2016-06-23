import * as path from 'path';
import {User} from './User';
export  {User} from './User';
import {router} from './routes';
import {Lazy} from 'lazyt'
import * as syncedmap from  'syncedmap';
export {Service} from 'syncedmap';

export let storePath = path.join(
    // BasePath 
    process.env.KOA_STORE ? process.env.KOA_STORE : process.cwd(), 
    'users.db'
    );

export let service = new Lazy<syncedmap.Service<User>>(()=>{
    return syncedmap.factory.create<User>( user=> user.name , storePath)
})

export const routes = router.routes() ;





