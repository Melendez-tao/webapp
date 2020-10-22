const express = require('express')
const Question = require('../database/model/Question')
const User = require('../database/model/User')
const Category = require('../database/model/Category')
const Answer = require('../database/model/Answer')
const Relation = require('../database/model/RelationBetCateAndQues')
const File = require('../database/model/File')
const  bcrypt = require('bcryptjs')
const AWS = require('aws-sdk')
const multer = require('multer')
const uuid = require('uuid')
const QAF = require('../database/model/RelationBetQAndFile')
const AAF = require('../database/model/RelationBetAandFile')
require('dotenv/config')
// const  bcrypt = require('bcryptjs')
const router = express.Router();
const storage = multer.memoryStorage({
    destination:function (req,file,callback) {
    callback(null,'')
    }
})
const upload = multer({storage}).array('image',10)
const s3 = new AWS.S3({
    accessKeyId:process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET
})
//post questions
router.post('',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined)
        res.send({msg:"No Authorization, you can't post question"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const user_id = model.dataValues.user_id;
    const question_text = req.body.question_text;
    const question = await Question.create({user_id,question_text})
    const question_id = question.dataValues.question_id;
    const categories = req.body.categories;
    for(let i = 0; i < categories.length;i++){
        var category = categories[i].category;
        const catetmp = await Category.findOne({where:{category}})
        if(!catetmp){
            const c = await Category.create({category})
            delete c.dataValues.createdAt;
            delete c.dataValues.updatedAt;
            categories[i] = c.dataValues;
            const category_id = categories[i].category_id;
            Relation.create({category_id,question_id})
        } else if(catetmp) {
            const c  = await Category.findOne({where:{category}})
            delete c.dataValues.createdAt;
            delete c.dataValues.updatedAt;
            categories[i] = c.dataValues;
            const category_id = categories[i].category_id;
            Relation.create({category_id,question_id})
        }
    }
    question.dataValues.categories = categories;
    const answers = await Answer.findAll({where:{question_id}})
    question.dataValues.answers = answers;
    question.dataValues.attachments = [];
    res.json(question.dataValues);
})

router.post('/:id/file',upload, async (req,res) => {
    const auth = req.headers.authorization;
    const fileArray = req.files;
    console.log(req.files);
    const imageArray = [];
    if(auth == undefined){
        res.status(403);
        res.send({msg:"No Authorization, you can't delete question"})
    }
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid){
            res.status(400)
           res.send({msg:'wrong password'})
        }
    }
    const user_id = model.dataValues.user_id;
    const question_id = req.params.id;
    const question = await Question.findOne({where:{question_id}});
    if(!question)
        res.send({msg:"no such question!"})
    if(user_id != question.dataValues.user_id){
        res.send({msg:'This question is not posted by you, you can not post images'})
    }
    for(let i = 0; i < fileArray.length;i++){
        console.log(i);
        let file_name = fileArray[i].originalname;
        console.log(file_name);
        const s3_object_name = uuid.v4() + file_name;
        console.log(s3_object_name)
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: s3_object_name,
            Body: fileArray[i].buffer
        }
        s3.upload(params,(err,data) => {
            if(err){
                res.status(500).send(err)
            }
        })
        console.log(typeof s3_object_name)
        const file = await File.create({file_name,s3_object_name})
        delete file.dataValues.updatedAt;
        imageArray[imageArray.length] = file.dataValues;
        console.log(file.dataValues);
        const file_id = file.dataValues.file_id;
        QAF.create({question_id,file_id})
        if(i == fileArray.length - 1){
            res.status(200).send(imageArray);
        }
    }
})
//delete file
router.delete('/:id/file/:fid',async (req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined){
        res.status(403);
        res.send({msg:"No Authorization, you can't delete this image"})
    }
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid){
            res.status(400)
            res.send({msg:'wrong password'})
        }
    }
    const file_id = req.params.fid;
    const file = await File.findOne({where:{file_id}})
    if(!file){
        res.status(400);
        res.send("no such image")
    }else{
        const key = file.dataValues.s3_object_name;
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key:key
        }
        s3.deleteObject(params,function (err, data) {
            if(err){
                res.status(400).send(err);
            }else{
                res.status(200).send("delete successfully");
            }
        })
        File.destroy({where:{file_id}})
        QAF.destroy({where:{file_id}})
    }
})

//delete questions
router.delete('/:id',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined)
        res.send({msg:"No Authorization, you can't delete question"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const user_id = model.dataValues.user_id;
    const question_id = req.params.id;
    const question = await Question.findOne({where:{question_id}});
    if(!question)
        res.send({
            msg:"no such question!"
        })
    const answers = await Answer.findAll({where:{question_id}})
    if(user_id != question.dataValues.user_id){
        res.send({msg:'This question is not posted by you, you can not delete it'})
    }else if(answers.length != 0) {
        res.send({msg: "Someone answered this question, you can't delete it!"})
    }else{
        const question = await Question.destroy({where:{question_id}});
        res.send({msg:'delete successfully!'})
    }
})
//update question
router.put('/:id',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined)
        res.send({msg:"No Authorization, you can't update question"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const user_id = model.dataValues.user_id;
    const question_id = req.params.id;
    const question = await Question.findOne({where:{question_id}});
    if(!question)
        res.send({msg:"no such question"})
    if(user_id != question.dataValues.user_id){
        res.send({msg:'This question is not posted by you, you can not udpate it'})
    }else{
        const question_text = req.body.question_text;
        const model = await question.update({question_text});
        Relation.destroy({where:{question_id}})
        const categories = req.body.categories;
        for(let i = 0; i < categories.length;i++){
            var category = categories[i].category;
            const catetmp = await Category.findOne({where:{category}})
            if(!catetmp){
                const c = await Category.create({category})
                delete c.dataValues.createdAt;
                delete c.dataValues.updatedAt;
                categories[i] = c.dataValues;
                const category_id = categories[i].category_id;
                Relation.create({category_id,question_id})
            }
            else {
                categories[i] = await Category.findOne({where:{category}})
                delete categories[i].dataValues.createdAt;
                delete categories[i].dataValues.updatedAt;
                categories[i] = categories[i].dataValues;
                const category_id = categories[i].category_id;
                Relation.create({category_id,question_id})
            }

        }
        model.dataValues.categories = categories;
        const answers = await Answer.findAll({where:{question_id}})
        model.dataValues.answers = answers;
        res.json(model.dataValues);
    }
})
//post answers
router.post('/:id/answer',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined)
        res.send({msg:"No Authorization, you can't post answers"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const user_id = model.dataValues.user_id;
    const question_id = req.params.id;
    const answer_text = req.body.answer_text;
    const answer = await Answer.create({question_id,user_id,answer_text})
    // console.log(answer.dataValues);
    answer.dataValues.attachments = [];
    res.json(answer.dataValues);
})
//post images to answer
router.post('/:qid/answer/:aid/file',upload,async(req,res) => {
    const auth = req.headers.authorization;
    const fileArray = req.files;
    console.log(auth);
    console.log(req.files);

    if(auth == undefined) {
        res.status(403)
        res.send({msg: "no authorization, you can't post images"})
    }
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}});
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid){
            res.status(400);
            return res.send({msg:'wrong password'})
        }
    }
    const user_id = model.dataValues.user_id;
    const answer_id = req.params.aid;
    const answer = await Answer.findOne({where:{answer_id}});
    if(user_id != answer.dataValues.user_id){
        res.status(400);
        res.send({msg:'This answer is not posted by you, you can not post images'})
    }

    let imageArray = [];
    for(let i = 0; i < fileArray.length;i++){
        let file_name = fileArray[i].originalname;
        const s3_object_name = uuid.v4() + file_name;
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: s3_object_name,
            Body: fileArray[i].buffer
        }
        s3.upload(params,(err,data) => {
            if(err){
                res.status(500).send(err)
            }
        })
        const file =  await File.create({file_name,s3_object_name})
        delete file.dataValues.updatedAt;
        imageArray[imageArray.length] = file.dataValues;
        const file_id = file.dataValues.file_id;
        AAF.create({answer_id,file_id})
        // dataArray[dataArray.length] = data
        if(i == fileArray.length - 1){
            res.status(200).send(imageArray);
        }
    }
})
//delete file of answers
router.delete('/:qid/answer/:aid/file/:fid',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined)
        res.send({msg:"no authorization, you can't delete images"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}});
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const file_id = req.params.fid;
    const file = await File.findOne({where:{file_id}})
    if(!file){
        res.status(400).send("no such image")
    }
    const key = file.dataValues.s3_object_name
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: key
    }
    s3.deleteObject(params,function (err, data) {
        if(err){
            res.status(400).send(err)
        }else{
            res.status(200).send("delete successfully from bucket")
        }
    })
    File.destroy({where:{file_id}})
    AAF.destroy({where:{file_id}})
})
//delete answers
router.delete('/:qid/answer/:aid',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined){
        res.status(403)
        res.send({msg:"no authorization, you can't delete answer"})
    }
    if(auth == undefined)
        res.send({msg:"no authorization, you can't delete question"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}});
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const user_id = model.dataValues.user_id;
    const answer_id = req.params.aid;
    const answer = await Answer.findOne({where:{answer_id}});
    if(user_id != answer.dataValues.user_id){
        res.send({msg:'This answer is not posted by you, you can not delete it'})
    }else{
        Answer.destroy({where:{answer_id}});
        res.send({msg:'delete successfully!'})
    }
})
router.put('/:qid/answer/:aid',async(req,res) => {
    const auth = req.headers.authorization;
    if(auth == undefined)
        res.send({msg:"No Authorization,You can't update this answer"})
    const token = String(auth).split(' ').pop();
    const userNamePassword = new Buffer.from(token,'base64').toString();
    const temp = userNamePassword.split(":")
    const username = temp[0];
    const password = temp[1];
    const model = await User.findOne({where:{username}})
    if(!model){
        res.status(400);
        return res.send({msg : 'no such account'})
    }else{
        const passwordValid = bcrypt.compareSync(password,model.dataValues.password)
        if(!passwordValid)
            return res.send({msg:'wrong password'})
    }
    const user_id = model.dataValues.user_id;
    const answer_id = req.params.aid;
    console.log(answer_id);
    const answer = await Answer.findOne({where:{answer_id}});
    if(user_id != answer.dataValues.user_id){
        res.send({msg:'This answer is not posted by you, you can not update it'})
    }else{
        const answer_text = req.body.answer_text;
        const model = await answer.update({answer_text})
        res.json(model.dataValues)
    }
})

//get answer without auth
router.get('/:qid/answer/:aid',async(req,res) => {
        const answer_id = req.params.aid;
        const answer = await Answer.findOne({where:{answer_id}})
        if(!answer)
            res.send({
                msg:"no such answer"
            })
        const aaf = await AAF.findAll({where:{answer_id}})
    for(let i = 0; i < aaf.length;i++){
        const file_id = aaf[i].dataValues.file_id;
        const file = await File.findOne({where:{file_id}})
        aaf[i] = file.dataValues
    }
        answer.dataValues.attachments = aaf;
        res.json(answer.dataValues);
})
//get question with id without auth
router.get('/:id',async(req,res) =>{
    const question_id = req.params.id;
    const question = await Question.findOne({where:{question_id}})
    if(!question){
        res.send({msg:"no such question"})
    }
    const relation = await Relation.findAll({where:{question_id}})
    const qaf = await QAF.findAll({where:{question_id}})
    for(let i = 0; i < qaf.length;i++){
        const file_id = qaf[i].dataValues.file_id;
        const file = await File.findOne({where:{file_id}})
        qaf[i] = file.dataValues;
    }
    for(let i = 0 ; i < relation.length;i++){
        const category_id = relation[i].dataValues.category_id;
        const category = await Category.findOne({where:{category_id}})
        relation[i] = category.dataValues;
    }
    question.dataValues.categories = relation;

    const answers = await Answer.findAll({where:{question_id}})
    for(let i = 0; i < answers.length;i++){
        const answer_id = answers[i].dataValues.answer_id;
        const aaf = await AAF.findAll({where:{answer_id}})
        for(let i = 0; i < aaf.length;i++){
            const file_id = aaf[i].dataValues.file_id;
            const file = await File.findOne({where:{file_id}})
            aaf[i] = file.dataValues
        }
        answers[i].dataValues.attachments = aaf;
    }
    question.dataValues.answers = answers;
    question.dataValues.attachments = qaf;
    res.json(question.dataValues);
})
//get all question
router.get('',async(req,res) => {
    const questions = await Question.findAll();
    for(let i = 0;i < questions.length;i++){
        const question_id = questions[i].dataValues.question_id;
        const question = await Question.findOne({where:{question_id}})
        const relation = await Relation.findAll({where:{question_id}})
        const qaf = await QAF.findAll({where:{question_id}})
        for(let i = 0; i < qaf.length;i++){
            const file_id = qaf[i].dataValues.file_id;
            const file = await File.findOne({where:{file_id}})
            qaf[i] = file.dataValues;
        }
        for(let i = 0 ; i < relation.length;i++){
            const category_id = relation[i].dataValues.category_id;
            const category = await Category.findOne({where:{category_id}})
            if(category)
            relation[i] = category.dataValues;
        }
        question.dataValues.categories = relation;
        const answers = await Answer.findAll({where:{question_id}})
        for(let i = 0; i < answers.length;i++){
            const answer_id = answers[i].dataValues.answer_id;
            const aaf = await AAF.findAll({where:{answer_id}})
            for(let i = 0; i < aaf.length;i++){
                const file_id = aaf[i].dataValues.file_id;
                const file = await File.findOne({where:{file_id}})
                aaf[i] = file.dataValues
            }
            answers[i].dataValues.attachments = aaf;
        }
        question.dataValues.answers = answers;
        question.dataValues.attachments = qaf
        questions[i] = question.dataValues;
    }
    res.json(questions);
})
module.exports = router