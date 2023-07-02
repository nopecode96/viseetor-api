module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/information.controller");
    var router = require("express").Router();

    // router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getAccountDetail);
    router.get("/message", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getMessage);
    router.put("/message-read", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateRead);
    router.get("/promotion", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getPromotionAll);
    app.use('/' + process.env.ENVIRONMENT + '/marketing/info', router);
};