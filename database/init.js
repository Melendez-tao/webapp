const Sequelize = require('sequelize')

const sequelize = new Sequelize('user','root','980722',{
    host: "localhost",
    prot:'3306',
    dialect: 'mysql'
})

sequelize.authenticate()
    .then(() => {
        console.log('connect successfully');
    })
    .catch(err => {
        console.error('connection failed',err);
    });

module.exports ={Sequelize,sequelize}