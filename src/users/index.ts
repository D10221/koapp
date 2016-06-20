import * as fs from 'fs' ;
import * as path from 'path';
import {User} from './User';
import {Users} from './service';
import {router} from './routes';
import * as encoder from '../maps/encoder'

export let storePath = path.join(process.cwd(), 'users.json');

function getStore(storePath:string) : Map<string,User> {

    return fs.existsSync(storePath) ? encoder.DeserializeFromFileSync<string,User>(storePath) : null 
}

export let service = new Users(getStore(storePath));

service.events.where(e=>e.key in ['set', 'add', 'remove', 'clear'])
.subscribe(e=>{    
    encoder.SerializeToFile(storePath, service._users)
})

export const routes = router.routes() ;



