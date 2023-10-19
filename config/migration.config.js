// const fs = require('fs');

const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database:  process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: 5432,
    dialect: 'postgres'
  },
  // test: {
  //   username: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database:  process.env.DB_NAME,
  //   host: process.env.DB_HOST,
  //   port: 5432,
  //   dialect: 'postgres'
  //   /* dialectOptions: {
  //     bigNumberStrings: true,
  //     ssl: {
  //       ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt')
  //     }
  //   } */
  // },
  // production: {
  //   username: process.env.DB_USER,
  //   password: process.env.DB_PASSWORD,
  //   database:  process.env.DB_NAME,
  //   host: process.env.DB_HOST,
  //   port: 5432,
  //   dialect: 'postgres'
  //   /* dialectOptions: {
  //     bigNumberStrings: true,
  //     ssl: {
  //       ca: fs.readFileSync(__dirname + '/mysql-ca-main.crt')
  //     }
  //   } */
  // }
};
