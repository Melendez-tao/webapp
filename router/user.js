const express = require('express')
const User = require('../database/model/User')
const  bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router();

//create
router.post('/create',async (req,res) => {
    // res.json(req.body);
    const lastname = req.body.lastname;
    const firstname = req.body.firstname;
    const password = req.body.password;
    const username = req.body.username;
    const model = await User.findOne({where:{username}})
    if(model){
        res.status(400);
        return res.send({msg:'email has been resgistered'})
    }else if(password.length < 8 || !judge(password)){
        return res.send({msg:'password is too simple, please type another one!'})
    }else
     user = await User.create({lastname,firstname,password: bcrypt.hashSync(password ),username})
res.status(200);
    delete user.dataValues.password;
    console.log(user.dataValues);
    res.json(user.dataValues);
})
//get info
router.get('/self',async(req,res) => {
    const password = req.body.password;
    const username = req.body.username;
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no this account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})

        const token = jwt.sign({username},"wttztt")
        console.log(token);
        delete model.dataValues.password;
        res.json(model);
    }
})
// verify
router.get('/auth',async(req,res) => {
    const token = String(req.headers.authorization).split(' ').pop()
    if(!token)
        return res.send({msg:'no token'})
    const {username} = jwt.verify(token,"wttztt")
    const model = await User.findOne({where:{username}})
    if(!model){
        return res.send({msg : 'no this account'})
    }
    return res.send({msg:'token verified!'})
})
//update
router.put('/update',async(req,res) =>{
    const lastname = req.body.lastname;
    const firstname = req.body.firstname;
    const password = req.body.password;
    const username = req.body.username;
    const model = await User.findOne({where:{lastname}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no this account'})
    }else{
        if(model.dataValues.username != username){
            res.status(400);
            return res.send({msg:'cant change username'})
        }
            user = await model.update({lastname,firstname,password: bcrypt.hashSync(password)})
            console.log("update successfully")
            delete user.dataValues.password;
            res.json(user.dataValues);
        }
})
// check password
    function judge(password){
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