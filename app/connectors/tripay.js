const axios = require('axios');

const { generateHmac } = require('../utils/encrypt');

class Tripay {

    constructor(logger, options) {
        this.logger = logger;
        this.apiKey = options.apiKey;
        this.privateKey = options.privateKey;
        this.baseUrl = options.baseUrl;
        this.merchantCode = options.merchantCode;
        this.paymentReturnUrl = options.paymentReturnUrl;
    }

    setHeader() {
        return {
            'Authorization': `Bearer ${this.apiKey}`
        }
    }

    async getPaymentChannel() {
        const url = `${this.baseUrl}/merchant/payment-channel`
        const headers = this.setHeader();

        this.logger.info(`[TRIPAY] Request ${url} headers: ${headers}`)
        try {
            const resp = await axios.get(url, {headers: headers});
            this.logger.info(`[TRIPAY] Response ${url}, status: ${resp.status}, headers: ${JSON.stringify(resp.headers)} body: ${JSON.stringify(resp.data)}`)
            return resp.data;
        } catch (err) {
            this.logger.error(`[TRIPAY] Error ${err}`)
            return err;
        }
    }

    async createClosePayment(payload) {
        const url = `${this.baseUrl}/transaction/create`
        const headers = this.setHeader();

        const signature = generateHmac('sha256', this.merchantCode+payload.merchant_ref+payload.amount, this.privateKey)

        Object.assign(payload, {
            return_url: `${this.paymentReturnUrl}?orderNumber=${payload.merchant_ref}`,
            signature: signature
        })

        this.logger.info(`[TRIPAY] Request ${url}, headers: ${JSON.stringify(headers)}, body: ${JSON.stringify(payload)}`)
        try {
            const resp = await axios.post(url, payload, {headers: headers});
            this.logger.info(`[TRIPAY] Response ${url}, status: ${resp.status}, headers: ${JSON.stringify(resp.headers)} body: ${JSON.stringify(resp.data)}`)
            return resp.data;
        } catch (err) {
            this.logger.error(err)
            this.logger.error(`[TRIPAY] Error ${err}`)
            return err;
        }
    }

    async createOpenPayment(payload) {
        const url = `${this.baseUrl}/open-payment/create`
        const headers = this.setHeader();

        const signature = generateHmac('sha256', this.merchantCode+payload.method+payload.merchant_ref, this.privateKey)

        Object.assign(payload, {
            merchant_code: this.merchantCode,
            signature: signature
        })

        this.logger.info(`[TRIPAY] Request ${url}, headers: ${JSON.stringify(headers)}, body: ${JSON.stringify(payload)}`)
        try {
            const resp = await axios.post(url, payload, {headers: headers});
            this.logger.info(`[TRIPAY] Response ${url}, status: ${resp.status}, headers: ${JSON.stringify(resp.headers)} body: ${JSON.stringify(resp.data)}`)
            return resp.data;
        } catch (err) {
            this.logger.error(`[TRIPAY] Error ${err}`)
            return err;
        }
    }

    async getDetail(reference) {
        const url = `${this.baseUrl}/transaction/detail?reference=${reference}`
        const headers = this.setHeader();

        this.logger.info(`[TRIPAY] Request ${url} headers: ${headers}`)
        try {
            const resp = await axios.get(url, {headers: headers});
            this.logger.info(`[TRIPAY] Response ${url}, status: ${resp.status}, headers: ${JSON.stringify(resp.headers)} body: ${JSON.stringify(resp.data)}`)
            return resp;
        } catch (err) {
            this.logger.error(`[TRIPAY] Error ${err}`)
            return err;
        }
    }
}

module.exports = Tripay;
