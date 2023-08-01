module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/information.controller");
    var router = require("express").Router();

    router.get("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getPrommo);
    app.use('/' + process.env.ENVIRONMENT + '/admin/information', router);
};