module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/spv/dashboard.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenSpvValidation, controller.getDataDashboard);
    // // router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    // router.put("/withdraw-success", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.withdrawUpdateSuccess);
    // router.put("/withdraw-reject", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.withdrawUpdateReject);
    app.use('/' + process.env.ENVIRONMENT + '/spv/dashboard', router);
};