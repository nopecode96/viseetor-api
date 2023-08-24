module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/activity.controller");
    var router = require("express").Router();

    router.get("/client", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getClient);
    router.get("/event", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.findEvents);
    router.get("/guest", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.findGuest);
    app.use('/' + process.env.ENVIRONMENT + '/admin/activity', router);
};