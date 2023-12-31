module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/dashboard.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDashboardData);

    app.use('/' + process.env.ENVIRONMENT + '/marketing/dashboard', router);
}