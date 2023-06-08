module.exports = app => {
  const authValidation = require("../../config/auth.config.js");
  const controller = require("../controllers/auth.controller.js");
  var router = require("express").Router();

  router.post("/login", authValidation.apiKeyValidation, controller.login);
  router.post("/logincheck", authValidation.apiKeyValidation, controller.logincheck);
  app.use('/v2/auth', router);
};