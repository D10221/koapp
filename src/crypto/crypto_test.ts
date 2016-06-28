import * as crypt from './'
import * as test from 'tape';
import * as Debug from 'debug';
const debug = Debug('koapp');

test.onFinish(e => {
    if (e) {
        debug(e.message);
    }
    process.exit();
})
test('crypt.decrypt(crypt.encryp)', (t) => {
    let e = crypt.encrypt('hello');
    let o = crypt.decrypt(e);
    t.assert(o ==  'hello');
    t.end();
})   