module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/transaction.controller");
    var router = require("express").Router();

    // router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getAccountDetail);
    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getTransactions);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.get("/create-page", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createTransactionPage);
    // router.get("/price", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getPriceAll);
    router.get("/priceone", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getPriceOne);
    router.get("/promocode", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getPromoCode);
    router.get("/eventsearch", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllEvent);
    router.get("/paymentbank", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.paymentBank);
    router.post("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createTransaction);
    app.use('/v2/marketing/transactions', router);
};