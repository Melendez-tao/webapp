const express = require('express')
const User = require('../database/model/User')
const  bcrypt = require('bcryptjs')
const lynx = require('lynx')
const router = express.Router();
const logger = require('../log')
var metrics = new lynx('54.89.237.139',8125)
var metrics = new lynx('')
//create
router.post('',async (req,res) => {
    // res.json(req.body);
    const timer =  metrics.createTimer('post user Api')
    const lastname = req.body.lastname;
    const firstname = req.body.firstname;
    const password = req.body.password;
    const username = req.body.username;
    const model = await User.findOne({where:{username}})
    if(model){
        res.status(400);
        logger.error('email has been resgistered')
        return res.send({msg:'email has been resgistered'})
    }else if(password.length < 8 || !router.judge(password)){
        return res.send({msg:'password is too simple, please type another one!'})
    }else
         userTimer = metrics.createTimer('create User execution')
     user = await User.create({lastname,firstname,password: bcrypt.hashSync(password ),username})
        userTimer.stop();
    res.status(200)
    delete user.dataValues.password;
    console.log(user.dataValues);
    res.json(user.dataValues);
    timer.stop();
    metrics.increment('post user api', 0.1)
})
//get info
router.get('/self',async(req,res) => {
    const token = String(req.headers.authorization).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const password = temp[1];
    const username = temp[0];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no this account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
        delete model.dataValues.password;
        res.json(model);
    }
})
// verify
router.get('/:id',async(req,res) => {
        const user_id = req.params.id;
        const model = await User.findOne({where:{user_id}})
    if(!model){
        res.status(400);
        return res.send({msg:'no such user'})
    }else {
        delete model.dataValues.password;
        res.json(model);
    }
})
//update
router.put('/self',async(req,res) =>{
    const token = String(req.headers.authorization).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const password = temp[1];
    const username = temp[0];
    const lastname = req.body.lastname;
    const firstname = req.body.firstname;
    const updatePassword = req.body.password;
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
        if(req.body.username){
            res.status(400);
            return res.send({msg:'cant change username'})
        }
            user = await model.update({lastname,firstname,password: bcrypt.hashSync(updatePassword)})
            console.log("update successfully")
            delete user.dataValues.password;
            res.json(user.dataValues);
        }
})
// check password
    router.judge = (password) => {
    let numOfNumber = 0;
    let numOfChar = 0;
    for(let i = 0; i < password.length;i++ ){
        let c = password.charAt(i);
        if(c >'0' && c <'9'){
            numOfNumber++;
        }else if (c < 'z'&& c > 'a' || c >'A' && c < 'Z'){
            numOfChar++;
        }
    }
    if(numOfNumber == 0 || numOfChar == 0)
        return false
    else
        return true;
}
module.exports = router