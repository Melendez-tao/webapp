const {Sequelize,sequelize} = require('../init')

const User = sequelize.define('users',{
    user_id:{
      type:Sequelize.UUID,
        allowNull:false,
        primaryKey:true,
        defaultValue:Sequelize.UUIDV1,
        unique:true
    },
    lastname:{
        type: Sequelize.STRING,
        validate:{
            notEmpty: true
        }
    },
    firstname:{
        type: Sequelize.STRING,
        validate:{
            notEmpty: true
        }
    },
    password:{
        type: Sequelize.STRING,
        validate:{
            notEmpty: true
        }
    },
    username:{
        type: Sequelize.STRING,
        unique: true,
        noupdate: true,
        isEmail:true,
        validate:{
            notEmpty: true,

        }
    }
})

// User.sync().then(() => {
//     console.log('user model has been synchronized');
// });

module.exports = User