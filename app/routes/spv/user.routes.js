module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/spv/users.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenSpvValidation, controller.findMyUsers);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenSpvValidation, controller.getDetail);
    app.use('/' + process.env.ENVIRONMENT + '/spv/users', router);
};