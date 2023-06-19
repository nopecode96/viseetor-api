module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/commission.controller");
    var router = require("express").Router();

    // router.get("/totalboard", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getTotalBoard);
    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getCommissionList);
    router.get("/widrawal-create-page", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getWidrawalCreatePage);
    router.get("/widrawal-list", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getWidrawalList);
    router.post("/widrawal-create", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.WidrawalCreate);

    app.use('/v2/marketing/commission', router);
}