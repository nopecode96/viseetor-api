module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const controller = require("../../controllers/thirdparty/motasi.controller");
    var router = require("express").Router();

    router.get("/check-mutasi", controller.checkmutasi);
    app.use('/' + process.env.ENVIRONMENT + '/thirdpary', router);

    router.post("/webhook", controller.webhook);
    app.use('/' + process.env.ENVIRONMENT + '/thirdparty/motasi', router);
};
