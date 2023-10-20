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

    var storage2 = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log(file);
            cb(null, process.env.MNT_PATH + '/socmed')
        },
        filename: function (req, file, cb) {
            console.log(req);
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload2 = multer({ storage: storage2 })

    router.get("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getPromo);
    router.get("/promo-detail", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getPromoDetail);
    router.put("/promo-published", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.updatePromoPublished);
    router.put("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, upload.single('image'), controller.promoUpdate);
    router.post("/promo", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, upload.single('image'), controller.postPromo);
    /////======Socmed==========///
    router.get("/socmed", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getSocmedMaterial);
    router.delete("/socmed", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.deleteSocmed);
    router.get("/socmed-detail", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.getSocmedDetail);
    router.put("/socmed-published", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, controller.updateSocmedPublished);
    router.put("/socmed", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, upload2.single('image'), controller.socmedMaterialUpdate);
    router.post("/socmed", authValidation.apiKeyValidation, authValidation.tokenAdminValidation, upload2.single('image'), controller.postSocmed);
    app.use('/' + process.env.ENVIRONMENT + '/admin/information', router);
};