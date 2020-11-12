const  express = require('express')
const router = require('./router/user')
const qrouter = require('./router/question')
const bodyParser = require('body-parser')
const logger = require('./log')
const cors = require('cors')
require('./database/init');
require('./database/model/User');
require('./database/model/Answer');
require('./database/model/Category');
require('./database/model/Question')
require('./database/model/RelationBetCateAndQues')
require('./database/model/File')
require("./database/model/RelationBetAandFile")
require("./database/model/RelationBetQAndFile")

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cors())
app.use(bodyParser.json());
app.use('/v1/question',qrouter)
app.use('/v1/user',router)
app.listen(3000,() => {
    logger.info('serve is running on 3000');
    // console.log('serve is running on 3000');
    logger.info('test ')
})
