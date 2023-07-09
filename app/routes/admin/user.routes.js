module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/users.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAll);
    router.get("/type", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllUserType);
    router.get("/status", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllUserStatus);
    // router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.post("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createOne);
    // router.put("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.update);
    app.use('/' + process.env.ENVIRONMENT + '/admin/users', router);
};