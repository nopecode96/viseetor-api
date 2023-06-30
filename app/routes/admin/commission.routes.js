module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/commission.controller");
    var router = require("express").Router();

    router.get("/withdraw", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getWithdrawalList);
    // router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.put("/withdraw-success", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.withdrawUpdateSuccess);
    router.put("/withdraw-reject", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.withdrawUpdateReject);
    app.use('/v2/admin/commissions', router);
};