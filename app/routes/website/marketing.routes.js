module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/website/marketing.controller");
    var router = require("express").Router();

    router.get("/wedding", authValidation.apiKeyValidation, controller.getProductWedding);
    // router.put("/attendingupdate", authValidation.apiKeyValidation, controller.updateStatusAttending);
    // router.get("/list", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getCommissionList);

    app.use('/' + process.env.ENVIRONMENT + '/website/product', router);
}