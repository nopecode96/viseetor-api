module.exports = app => {
  const dotenv = require('dotenv');
  dotenv.config();

  const authValidation = require("../../config/auth.config.js");
  const controller = require("../controllers/auth.controller.js");
  var router = require("express").Router();

  router.post("/login", authValidation.apiKeyValidation, controller.login);
  router.post("/logincheck", authValidation.apiKeyValidation, controller.logincheck);
  router.get("/register", authValidation.apiKeyValidation, controller.getRegisterMarketing);
  router.post("/register", authValidation.apiKeyValidation, controller.postRegisterMarketing);
  router.get("/find-spv", authValidation.apiKeyValidation, controller.findSpvByUserName);
  app.use('/' + process.env.ENVIRONMENT + '/auth', router);
};