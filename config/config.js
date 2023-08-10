require('dotenv').config()

module.exports = {
  development: {
    username: 'root',
    password: 'aTletI.21',
    database: 'attendance',
    // username: process.env.USERNAME_DATABASE,
    // password: process.env.PASSWORD_DATABASE,
    // database: process.env.NAME_DATABASE,
    host: "127.0.0.1",
    dialect: "mysql"
  },
  test: {
    username: "root",
    password: null,
    database: "database_test",
    host: "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    username: "root",
    password: null,
    database: "database_production",
    host: "127.0.0.1",
    dialect: "mysql"
  }
}
