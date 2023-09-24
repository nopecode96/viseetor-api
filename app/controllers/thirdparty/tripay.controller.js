const crypto = require('crypto');

/**
 * Webhook
 * @param {*} req 
 * @param {*} res 
 */
exports.webhook = async (req, res) => {
    const logger = req.app.locals.logger;
    const privateKey = process.env.TRIPAY_PRIVATE_KEY;

    const { paymentService } = req.app.locals.services;

    const signature = crypto.createHmac("sha256", privateKey)
        .update(JSON.stringify(req.body))
        .digest('hex');

    logger.info(`Signature: ${signature}`);

    const order_number = req.body.merchant_ref;
    const status = req.body.status; 

    const paymentReceived = await paymentService.received({order_number, status});

    return  res.status(paymentReceived.code).send(paymentReceived);
}
