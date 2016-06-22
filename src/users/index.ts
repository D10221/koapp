import * as path from 'path';
import {User} from './User';
import {router} from './routes';
import * as syncedmap from 'syncedmap';

export let storePath = path.join(process.cwd(), 'users.json');

export let service = syncedmap.factory.create<User>( user=> user.name , storePath)

export const routes = router.routes() ;



