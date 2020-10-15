const {Sequelize,sequelize} = require('../init')

const Answer = sequelize.define('answers',{
    answer_id:{
        type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:Sequelize.UUIDV1,
        unique:true,
        readOnly:true
    },
    question_id:{
        type: Sequelize.UUID
    },
    user_id:{
        type:Sequelize.UUID
    },
    answer_text:{
        type:Sequelize.STRING
    }
})

// Answer.sync().then(() => {
//     console.log('answer model has been synchronized');
// });

module.exports = Answer