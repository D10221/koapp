import {app} from './index';
import * as supertest from 'supertest';

var request = supertest.agent(app.listen());

describe('Hello World', function () {
    it('should say "Hello"', (done) => {
        request
            .get('/')
            .expect(200)
            .expect('Hello', done);
    });
});