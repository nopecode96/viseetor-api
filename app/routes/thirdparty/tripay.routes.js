module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const controller = require("../../controllers/thirdparty/tripay.controller");
    var router = require("express").Router();

    router.post("/webhook", controller.webhook);
    app.use('/' + process.env.ENVIRONMENT + '/thirdparty/tripay', router);

};
