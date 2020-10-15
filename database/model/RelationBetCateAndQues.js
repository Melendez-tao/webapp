const {Sequelize,sequelize} = require('../init')
const  Relation = sequelize.define('relationOFQAndC',{
    category_id:{
        type:Sequelize.UUID
    },
    question_id:{
        type:Sequelize.UUID
    }
})
// Relation.sync().then(() => {
//     console.log('Relation model has been synchronized');
// });

module.exports = Relation