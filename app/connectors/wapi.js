const axios = require('axios');

class Wapi {

    constructor(logger, options) {
        this.logger = logger;
        this.apiKey = options.apiKey;
        this.deviceKey = options.deviceKey;
        this.baseUrl = options.baseUrl;
    }

    setDefaultBody () {
        return {
            api_key: this.apiKey,
            device_key: this.deviceKey,

        }
    }

    async sendMessage(destinationNo, message) {
        const url = `${this.baseUrl}send-message`;

        const payload = {
            ...this.setDefaultBody(),
            destination: destinationNo,
            message: message
        }

        this.logger.info(`[WAPI] Request ${url}, bodyx ${JSON.stringify(payload)}`)

        try {
            const resp = await axios.post(url, payload, { 
                headers: { 'Content-Type': 'application/json' }
            });

            this.logger.info(`[WAPI] Response ${url}, status: ${resp.status}, headers: ${JSON.stringify(resp.headers)} body: ${JSON.stringify(resp.data)}`)
            return resp.data;
        } catch (err) {
            console.log('err wapi conn --', err)
            this.logger.error(`[WAPI] Error ${err}`)
            return err;
        }
    }
}

module.exports = Wapi;
