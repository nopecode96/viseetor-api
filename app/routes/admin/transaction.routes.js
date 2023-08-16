module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/transaction.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getTransactions);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getDetail);
    router.put("/paymentreceived", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.paymentReceived);
    app.use('/' + process.env.ENVIRONMENT + '/admin/transactions', router);
};