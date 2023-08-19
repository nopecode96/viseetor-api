module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/users.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.findAllUsersAdmin);
    router.get("/marketing", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.findAllMarketing);
    router.post("/marketing", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.createUserMarketing);
    router.get("/spv", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.findAllSpv);
    router.post("/spv", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.createUserSpv);
    router.put("/activated-user", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.activateUser);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getAccountDetail);
    router.put("/change-password", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.changePassword);
    app.use('/' + process.env.ENVIRONMENT + '/admin/users', router);
};