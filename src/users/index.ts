
import {Users} from './service';

import {router} from './routes';

export let service = new Users();

export const routes = router.routes() ;



