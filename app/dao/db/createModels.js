var SequelizeAuto = require('sequelize-auto')
var auto = new SequelizeAuto('db_tars', 'root', 'admin',{
    host: 'localhost',
    dialect: 'mysql',
    directory: './models', // prevents the program from writing to disk
    port: 3306,
    additional: {
        timestamps: false
    },
});

auto.run(function (err) {
    if (err) throw err;

    console.log(auto.tables); // table list
    console.log(auto.foreignKeys); // foreign key list
});

