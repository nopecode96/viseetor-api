module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/commission.controller");
    var router = require("express").Router();

    router.get("/withdraw", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getWithdrawalList);
    // router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.put("/withdraw-success", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.withdrawUpdateSuccess);
    router.put("/withdraw-reject", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.withdrawUpdateReject);
    app.use('/' + process.env.ENVIRONMENT + '/admin/commissions', router);
};