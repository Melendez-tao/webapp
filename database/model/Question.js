const {Sequelize,sequelize} = require('../init')

const Question = sequelize.define('questions',{
    question_id:{
        type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:Sequelize.UUIDV1,
        unique:true,
        readOnly:true
    },
    user_id:{
        type: Sequelize.UUID,
        readOnly: true
    },
    question_text:{
        type:Sequelize.STRING
    }
})

Question.sync().then(() => {
    console.log('question model has been synchronized');
});

module.exports = Question