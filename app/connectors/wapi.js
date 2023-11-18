const axios = require('axios');
const fs = require('fs');


class Wapi {

    constructor(logger, options) {
        this.logger = logger;
        Object.assign(this, options)
    }

    setDefaultBody () {
        return {
            api_key: this.apiKey,
            device_key: this.deviceKey,

        }
    }

    async sendMessage(destinationNo, message) {
        const url = `${this.sendMsgUrl}`;

        const payload = {
            ...this.setDefaultBody(),
            destination: destinationNo,
            message: message
        }

        this.logger.info(`[WAPI] Request ${url}, body ${JSON.stringify(payload)}`)

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

    async sendMessageImage(destination, caption, imgPath) {
        const url = `${this.sendMsgImageUrl}`;

        const config = {
            method: 'post',
            url: url,
            headers: { 'Content-Type': 'multipart/form-data' },
            data: { 
                ...this.setDefaultBody(), 
                destination, 
                image: fs.createReadStream(imgPath),
                caption
            },
        };

        // console.log('-- wapi connector sendmsgimg config', config)

        this.logger.info(`[WAPI] Request ${JSON.stringify(config)}`)

        try {
            const response = await axios(config);

            console.log('-- response', response);

            if (response.data.status !== "ok") {
                this.logger.error(`[WAPI] Response ${JSON.stringify(response)}`)
                return {
                    code: 200,
                    success: false,
                    message: response.data.message
                }
            }

            this.logger.info(`[WAPI] Response ${config}`)

            return {
                success: true,
                data: response.data.data
            }

        } catch (error) {
            this.logger.error(`[WAPI] Response ${JSON.stringify(error)}`)
            return {
                code: 200,
                success: false,
                message: error
            };
        }
    }
}

module.exports = Wapi;
