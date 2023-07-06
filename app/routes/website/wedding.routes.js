module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/website/wedding.controller");
    var router = require("express").Router();

    router.get("/data", authValidation.apiKeyValidation, controller.getData);
    router.put("/attendingupdate", authValidation.apiKeyValidation, controller.updateStatusAttending);
    // router.get("/list", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getCommissionList);

    app.use('/' + process.env.ENVIRONMENT + '/website/wedding', router);
}