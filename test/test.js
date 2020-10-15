const router = require('../router/user')
describe('password ', function() {
    it('validation', function(done) {
        const password = "888555w"
        if(router.judge(password) == false){
            return done;
        }
        done();
    });
});