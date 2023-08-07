module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/admin/information.controller");
    var router = require("express").Router();
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log(file);
            cb(null, process.env.MNT_PATH + '/promotions')
        },
        filename: function (req, file, cb) {
            console.log(req);
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage })

    router.get("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getPromo);
    router.get("/promo-detail", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getPromoDetail);
    router.put("/promo-published", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.updatePromoPublished);
    router.put("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, upload.single('image'), controller.promoUpdate);
    router.post("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, upload.single('image'), controller.postPromo);
    app.use('/' + process.env.ENVIRONMENT + '/admin/information', router);
};