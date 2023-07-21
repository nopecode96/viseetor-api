module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/scanner/access.controller.js");
    var router = require("express").Router();

    router.post("/access", authValidation.apiKeyValidation, controller.login);
    router.get("/home-data", authValidation.apiKeyValidation, authValidation.tokenMobileScannerAppValidation, controller.getHomeData);
    router.get("/guestlist", authValidation.apiKeyValidation, authValidation.tokenMobileScannerAppValidation, controller.getGuestList);
    router.put("/scan", authValidation.apiKeyValidation, authValidation.tokenMobileScannerAppValidation, controller.scanBarcode);
    app.use('/' + process.env.ENVIRONMENT + '/scanner', router);
};