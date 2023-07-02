module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/transaction.controller");
    var router = require("express").Router();

    // router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getAccountDetail);
    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getTransactions);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.get("/create-page", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createTransactionPage);
    router.get("/findprice", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getPriceOne);
    router.get("/findpromo", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getPromoCode);
    router.post("/create", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createTransaction);
    app.use('/' + process.env.ENVIRONMENT + '/marketing/transactions', router);
};