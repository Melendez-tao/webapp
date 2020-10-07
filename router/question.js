const express = require('express')
const Question = require('../database/model/Question')
const User = require('../database/model/User')
const Category = require('../database/model/Category')
const Answer = require('../database/model/Answer')
const Relation = require('../database/model/RelationBetCateAndQues')
const  bcrypt = require('bcryptjs')
// const  bcrypt = require('bcryptjs')
const router = express.Router();
//post questions
router.post('',async(req,res) => {
    const token = String(req.headers.authorization).split(' ').pop();
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
    res.json(question.dataValues);
})
//delete questions
router.delete('/:id',async(req,res) => {
    const token = String(req.headers.authorization).split(' ').pop();
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
    if(user_id != question.dataValues.user_id){
        res.send({msg:'This question is not posted by you, you can not delete it'})
    }else{
    const question = await Question.destroy({where:{question_id}});
    res.send({msg:'delete successfully!'})
    }
})

router.put('/:id',async(req,res) => {

    const token = String(req.headers.authorization).split(' ').pop();
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
    const token = String(req.headers.authorization).split(' ').pop();
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
    res.json(answer.dataValues);
})
//delete answers
router.delete('/:qid/answer/:aid',async(req,res) => {
    const token = String(req.headers.authorization).split(' ').pop();
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
    console.log(answer_id);
    const answer = await Answer.findOne({where:{answer_id}});
    if(user_id != answer.dataValues.user_id){
        res.send({msg:'This answer is not posted by you, you can not delete it'})
    }else{
        Question.destroy({where:{answer_id}});
        res.send({msg:'delete successfully!'})
    }
})
router.put('/:qid/answer/:aid',async(req,res) => {
    const token = String(req.headers.authorization).split(' ').pop();
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
        res.json(answer.dataValues);
})
//get question with id without auth
router.get('/:id',async(req,res) =>{
    const question_id = req.params.id;
    const question = await Question.findOne({where:{question_id}})
    const relation = await Relation.findAll({where:{question_id}})
    for(let i = 0 ; i < relation.length;i++){
        const category_id = relation[i].dataValues.category_id;
        const category = await Category.findOne({where:{category_id}})
        relation[i] = category.dataValues;
    }
    question.dataValues.categories = relation;
    const answers = await Answer.findAll({where:{question_id}})
    question.dataValues.answers = answers;
    res.json(question.dataValues);
})
//get all question
router.get('',async(req,res) => {
    const questions = await Question.findAll();
    for(let i = 0;i < questions.length;i++){
        const question_id = questions[i].dataValues.question_id;
        const question = await Question.findOne({where:{question_id}})
        const relation = await Relation.findAll({where:{question_id}})
        for(let i = 0 ; i < relation.length;i++){
            const category_id = relation[i].dataValues.category_id;
            const category = await Category.findOne({where:{category_id}})
            if(category)
            relation[i] = category.dataValues;
        }
        question.dataValues.categories = relation;
        const answers = await Answer.findAll({where:{question_id}})
        question.dataValues.answers = answers;
        questions[i] = question.dataValues;
    }
    // const jp = JSON.parse(questions);
    // console.log(typeof questions);
    // res.write(JSON.stringify(questions))
    res.json(questions);
})
module.exports = router