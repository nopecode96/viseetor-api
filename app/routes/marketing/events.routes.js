module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/events.controller");
    var router = require("express").Router();
    var multer = require('multer');
    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.MNT_PATH + '/event')
        },
        filename: function (req, file, cb) {
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload = multer({ storage: storage })

    var storage2 = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.MNT_PATH + '/event/gallery')
        },
        filename: function (req, file, cb) {
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload2 = multer({ storage: storage2 })

    var storage3 = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.MNT_PATH + '/event/bridegroom')
        },
        filename: function (req, file, cb) {
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload3 = multer({ storage: storage3 })

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findEvents);
    router.get("/expired", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findEventsExpired);
    router.post("/create", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('banner'), controller.create);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.get("/page-create-step1", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.pageCreateStep1);
    router.get("/page-create-step2", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.pageCreatesStep2);
    // router.get("/dashboard", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.dashboardEvent);
    // router.get("/all", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.allEvent);
    // router.get("/company", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllCompany);
    // router.get("/type", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllEventType);
    // router.get("/regional", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllRegional);
    // router.post("/noimage", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createOneNoImage);
    // router.post("/withimage", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('banner'), controller.createOneWithImage);
    // router.put("/noimage", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateOneNoImage);
    // router.put("/withimage", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('banner'), controller.updateOneWithImage);
    // router.post("/bank", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createOneBank);
    // router.delete("/bank", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.deleteOneBank);
    // router.post("/wedding", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createWeddingDetail);
    // router.put("/wedding", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateWeddingDetail);
    // router.put("/groomphoto", authValidation.apiKeyValidation, authValidation.tokenValidation, upload3.single('groom_photo'), controller.putGroomPhoto);
    // router.put("/bridephoto", authValidation.apiKeyValidation, authValidation.tokenValidation, upload3.single('bride_photo'), controller.putBridePhoto);
    // router.get("/guest/all", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.allEventGuest);
    // router.post("/guest", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createOneGuest);
    // router.put("/guest/attend", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateAttendStatusGuest);
    // router.delete("/guest", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.deleteOneGuest);
    // router.get("/gallery/all", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getGalleryList);
    // router.post("/gallery/upload", authValidation.apiKeyValidation, authValidation.tokenValidation, upload2.array('image'), controller.uploadPhoto);
    // router.post("/guest/attendingupdate/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateStatusAttending);
    // router.post("/guest/sendinvitation/list", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.sentInvitationlist);
    // router.post("/guest/sendinvitation/updateguestinvitationsent", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateGuestInvitationSent);
    // router.post("/guest/sendinvitation/updateguestbarcodesent", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateGuestBarcodeSent);
    // router.get("/themes", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.themes);
    // router.put("/themesupdate", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.themesSelected);
    app.use('/v2/marketing/events', router);
};