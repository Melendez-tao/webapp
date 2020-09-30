const  express = require('express')
const router = require('./router/user')
const bodyParser = require('body-parser')
require('./database/init');
require('./database/model/User');

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/user',router)
app.listen(3000,() => {
    console.log('serve is running on 3000');
})