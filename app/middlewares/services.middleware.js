const Payment = require('../services/payment');
const models = require("../models/index.model");
const { Tripay, Wapi,  } = require('../connectors');

module.exports = (req, res, next) => {
    const logger = req.app.locals.logger;

    req.app.locals.models = models;

    const tripayOptions = {
        apiKey: process.env.TRIPAY_API_KEY,
        baseUrl: process.env.TRIPAY_URL,
        privateKey: process.env.TRIPAY_PRIVATE_KEY,
        merchantCode: process.env.TRIPAY_MERCHANT_CODE,
        paymentReturnUrl: process.env.TRIPAY_PAYMENT_RETURN_URL
    }

    const wapiOptions = {
        apiKey: process.env.WAPI_API,
        deviceKey: process.env.WAPI_DEVICE,
        baseUrl: process.env.WAPI_URL,
        sendMsgUrl: process.env.WAPI_URL + process.env.WAPI_PATH_SEND_MSG,
        sendMsgImageUrl: process.env.WAPI_URL + process.env.WAPI_PATH_SEND_MSG_IMAGE
    }
    
    req.app.locals.connectors = {
        tripayConnector: new Tripay(logger, tripayOptions),
        wapiConnector: new Wapi(logger, wapiOptions)
    };

    const tripayConn = req.app.locals.connectors.tripayConnector;
    const wapiConn = req.app.locals.connectors.wapiConnector;

    req.app.locals.services = {
        paymentService: new Payment(logger, models, tripayConn, wapiConn)
    };

    return next();
}
