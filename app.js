const  express = require('express')
const router = require('./router/user')
const qrouter = require('./router/question')
const bodyParser = require('body-parser')
require('./database/init');
require('./database/model/User');
require('./database/model/Answer');
require('./database/model/Category');
require('./database/model/Question')
require('./database/model/RelationBetCateAndQues')
const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use('/v1/question',qrouter)
app.use('/v1/user',router)
app.listen(3000,() => {
    console.log('serve is running on 3000');
})
