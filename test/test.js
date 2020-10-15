const app = require('../app')
const chai = require('chai')
const request = require('supertest');
describe('get all question ', function() {
    it('responds with json', function(done) {
        request(app)
            .get('/v1/question')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200)
                .end(function(err, res) {
                    if (err) {
                        return done(err);
                    }else {
                        done();
                    }
                })
    });
});