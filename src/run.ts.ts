import {app} from './index';

let port = process.env.PORT || 3000;

app.listen(port);

console.log(`listening on port ${3000}`);