module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/commission.controller");
    var router = require("express").Router();

    router.get("/totalboard", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getTotalBoard);
    router.get("/list", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getCommissionList);

    app.use('/v2/marketing/commission', router);
}