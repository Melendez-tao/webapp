const {Sequelize,sequelize} = require('../init')

const QAF = sequelize.define("relationQAF",{

    file_id:{
        type: Sequelize.UUID
    },
    question_id:{
        type:Sequelize.UUID
    }
})

QAF.sync().then(() => {
    console.log('QAF model has been synchronized');
});

module.exports = QAF