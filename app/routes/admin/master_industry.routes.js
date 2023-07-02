module.exports = app => {
    const authValidation = require("../../../config/auth.config.js");
    const controller = require("../../controllers/admin/master_industry.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAll);
    router.get("/published", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllPublished);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.post("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createOne);
    router.put("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.update);
    app.use('/' + process.env.ENVIRONMENT + '/admin/master/industry', router);
};