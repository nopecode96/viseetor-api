module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/myclient.controller");
    var router = require("express").Router();
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            console.log('pppppp');
            console.log(file);
            cb(null, process.env.MNT_PATH + '/company')
        },
        filename: function (req, file, cb) {
            console.log(req);
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage })

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findMyClient);
    // router.get("/dashboard", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.dashboard);
    // router.get("/industry", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllIndustry);
    // router.get("/status", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllCompanyStatus);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.get("/detail-edit", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetailEdit);
    router.get("/regional", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllRegional);
    router.post("/noimage", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createOneNoImage);
    router.post("/withimage", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('logo'), controller.createOne);
    router.put("/noimage", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.editOne);
    router.put("/withimage", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('logo'), controller.editOneWithImage);
    app.use('/v2/marketing/myclient', router);
};