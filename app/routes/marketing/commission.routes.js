module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/commission.controller");
    var router = require("express").Router();

    // router.get("/totalboard", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getTotalBoard);
    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getCommissionList);
    router.get("/widrawal-page", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getWidrawalPage);

    app.use('/v2/marketing/commission', router);
}