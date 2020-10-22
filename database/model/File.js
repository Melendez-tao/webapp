const {Sequelize,sequelize} = require('../init')

const File = sequelize.define("files",{
    file_id:{
        type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:Sequelize.UUIDV1,
        unique:true,
        readOnly:true
    },
    file_name:{
        type: Sequelize.STRING,
        readOnly: true
    },
    s3_object_name:{
        type:Sequelize.STRING,
        readOnly: true
    }
})

File.sync().then(() => {
    console.log('file model has been synchronized');
});

module.exports = File