module.exports = app => {
    const dotenv = require('dotenv');
    dotenv.config();

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

    var storage4 = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, process.env.MNT_PATH + '/event/thumbnail')
        },
        filename: function (req, file, cb) {
            console.log(req);
            fileExtension = file.originalname.split('.')[1]
            cb(null, Date.now() + '.' + fileExtension)
            // cb(null, file.originalname)
        }
    })
    var upload4 = multer({ storage: storage4 })

    router.get("/", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findEvents);
    router.get("/expired", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findEventsExpired);
    router.put("/update", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateEvent);
    router.put("/banner-update", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('banner'), controller.putBanner);

    router.post("/create", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.create);
    router.get("/detail", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getDetail);
    router.get("/page-create", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.pageCreate);
    router.get("/find-web-template", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getWebTemplate);

    router.get("/guest", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.allEventGuest);
    router.post("/guest", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createGuest);
    router.delete("/guest", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.deleteGuest);
    router.put("/update-message-template", authValidation.apiKeyValidation, authValidation.tokenValidation, upload4.single('image'), controller.updateMessageTemplate);
    router.put("/guest-send-invitation", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.guestInvitationSent);
    router.put("/guest-send-barcode", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.guestBarcodeSent);
    router.put("/guest/attendingupdate", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateStatusAttending);
    router.get("/guest-for-bulk", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getBulkForInvitationSent);

    router.put("/wedding-update", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateWeddingDetail);
    router.put("/wedding-groomphoto", authValidation.apiKeyValidation, authValidation.tokenValidation, upload3.single('groom_photo'), controller.putGroomPhoto);
    router.put("/wedding-bridephoto", authValidation.apiKeyValidation, authValidation.tokenValidation, upload3.single('bride_photo'), controller.putBridePhoto);
    router.post("/bank-create", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createBank);
    router.delete("/bank-delete", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.deleteBank);
    router.put("/bank-status-update", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateGiftBankStatus);
    router.put("/themes-update", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.themesSelected);
    router.post("/gallery-upload", authValidation.apiKeyValidation, authValidation.tokenValidation, upload2.array('image'), controller.uploadGallery);
    router.delete("/gallery-delete", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.deleteGallery);

    router.get("/scanner-app", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.listScannerAccess);
    router.post("/scanner-app", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.postScannerAccess);

    // router.get("/guest/all", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.allEventGuest);
    // router.put("/guest/attend", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateAttendStatusGuest);
    // router.delete("/guest", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.deleteOneGuest);
    // router.get("/gallery/all", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.getGalleryList);
    // router.post("/gallery/upload", authValidation.apiKeyValidation, authValidation.tokenValidation, upload2.array('image'), controller.uploadPhoto);
    // router.post("/guest/sendinvitation/list", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.sentInvitationlist);
    // router.post("/guest/sendinvitation/updateguestbarcodesent", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateGuestBarcodeSent);
    // router.get("/themes", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.themes);
    app.use('/' + process.env.ENVIRONMENT + '/marketing/events', router);
};