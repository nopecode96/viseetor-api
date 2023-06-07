module.exports = app => {
    const authValidation = require("../../../config/auth.config");
    const controller = require("../../controllers/marketing/myprofile.controller");
    var router = require("express").Router();
    var multer  = require('multer');
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
    router.put("/changepassword", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.changePassword);
    router.get("/getcity", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllCity);
    router.get("/getoccupation", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllOccupation);
    router.get("/getbank", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.findAllBank);
    router.post("/profile", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.createProfile);
    router.put("/profile", authValidation.apiKeyValidation, authValidation.tokenValidation, controller.updateProfile);
    router.put("/changephoto", authValidation.apiKeyValidation, authValidation.tokenValidation, upload.single('photo'), controller.changePhoto);
    app.use('/marketing/myprofile', router);
};