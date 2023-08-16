module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/users.controller");
    var router = require("express").Router();

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllUsersAdmin);
    router.get("/marketing", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllMarketing);
    router.post("/marketing", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createUserMarketing);
    router.get("/spv", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllSpv);
    router.post("/spv", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createUserSpv);
    router.put("/update-status", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateStatusUser);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getAccountDetail);
    router.put("/change-password", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.changePassword);
    app.use('/' + process.env.ENVIRONMENT + '/admin/users', router);
};