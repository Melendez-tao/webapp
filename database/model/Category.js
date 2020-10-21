const {Sequelize,sequelize} = require('../init')

const  Category = sequelize.define('categories',{
    category_id:{
        type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:Sequelize.UUIDV1,
        unique:true,
        readOnly:true
    },
    category:{
        type:Sequelize.STRING
    }
})
Category.sync().then(() => {
    console.log('category model has been synchronized');
});

module.exports = Category