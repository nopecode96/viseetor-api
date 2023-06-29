module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/transaction.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getTransactions);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.put("/paymentreceived", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.paymentReceived);
    app.use('/v2/admin/transactions', router);
};