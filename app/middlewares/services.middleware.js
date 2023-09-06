const Payment = require('../services/payment');
const models = require("../models/index.model");
const { Tripay } = require('../connectors');

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
    
    req.app.locals.connectors = {
        tripayConnector: new Tripay(logger, tripayOptions)
    };

    const tripayConn = req.app.locals.connectors.tripayConnector;

    req.app.locals.services = {
        paymentService: new Payment(logger, models, tripayConn)
    };

    return next();
}
