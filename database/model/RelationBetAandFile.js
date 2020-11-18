const {Sequelize,sequelize} = require('../init')

const AAF = sequelize.define("relationAAF",{

    file_id:{
        type: Sequelize.UUID
    },
    answer_id:{
        type:Sequelize.UUID
    }
})

AAF.sync().then(() => {
    console.log('AAF model has been synchronized');
});

module.exports = AAF