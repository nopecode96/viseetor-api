module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const controller = require("../../controllers/thirdparty/motasi.controller");
    var router = require("express").Router();

    router.post("/motasi", controller.webhook);
    // router.post("/logincheck", authValidation.apiKeyValidation, controller.logincheck);
    app.use('/' + process.env.ENVIRONMENT + '/thirdpary', router);
};