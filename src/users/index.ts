import * as path from 'path';
import {User} from './User';
import {getService} from './service';
import {router} from './routes';

export let storePath = path.join(process.cwd(), 'users.json');

export let service = getService(storePath);

export const routes = router.routes() ;



