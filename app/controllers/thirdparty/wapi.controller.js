const db = require("../../models/index.model");
const sequelize = require('sequelize');
const axios = require("axios")
const format = require('date-format');

var functions = require("../../../config/function");
const { transaction } = require("../../models/index.model");

exports.wapiRestartDevice = (req, res) => {
    var data = JSON.stringify({
        "api_key": process.env.WAPI_API,
        "device_key": process.env.WAPI_DEVICE,
    });

    var config = {
        method: 'post',
        url: process.env.WAPI_URL + 'restart-device',
        headers: { 'Content-Type': 'application/json' },
        data: data
    };

    axios(config).then(function (response) {
        var result = response.data;
        // console.log(response.data)

        if (!result) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Error',
                response: result
            })
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Device has been reset',
            response: result
        })
        return;

    }).catch(function (error) {
        console.log(error);
        res.status(400).send({
            code: 400,
            success: false,
            message: error,
        })
        return;
        // return;
    });

}