module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config.js");
    const controller = require("../../controllers/thirdparty/wapi.controller");
    var router = require("express").Router();

    router.post("/restart-device", authValidation.apiKeyValidation, controller.wapiRestartDevice);
    app.use('/' + process.env.ENVIRONMENT + '/wapi', router);
};