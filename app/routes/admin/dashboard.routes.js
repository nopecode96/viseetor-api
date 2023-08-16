module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/dashboard.controller");
    var router = require("express").Router();

    router.get("/data", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getDataDashboard);
    // // router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    // router.put("/withdraw-success", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.withdrawUpdateSuccess);
    // router.put("/withdraw-reject", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.withdrawUpdateReject);
    app.use('/' + process.env.ENVIRONMENT + '/admin/dashboard', router);
};