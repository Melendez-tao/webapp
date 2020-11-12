const Sequelize = require('sequelize')

const sequelize = new Sequelize('user','root','wangtao123',{
    host: "csye6225-fall2020.cumwoi8ikzxd.us-east-1.rds.amazonaws.com",
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