module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/myprofile.controller");
    var router = require("express").Router();
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            // console.log('pppppp');
            // console.log(file);
            cb(null, process.env.MNT_PATH + '/users')
        },
        filename: function (req, file, cb) {
            // console.log(req);
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage })

    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getAccountDetail);
    router.get("/detail-edit", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetailEdit);
    router.put("/change-password", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.changePassword);
    router.put("/update", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.update);
    router.put("/change-photo", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('photo'), controller.changePhoto);
    app.use('/' + process.env.ENVIRONMENT + '/marketing/myprofile', router);
};