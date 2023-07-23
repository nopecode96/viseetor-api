const db = require("../../models/index.model");
const sequelize = require('sequelize');
const axios = require("axios")
const format = require('date-format');

var functions = require("../../../config/function");
const { transaction } = require("../../models/index.model");

exports.webhook = (req, res) => {
    console.log(req.headers);
    console.log(req.body);

    res.status(200).send({
        code: 200,
        success: true,
        message: 'Thanks',
    })
    return;

}

exports.checkmutasi = (req, res) => {
    const { type, bank } = req.query;
    const today = new Date();
    const lastWeek = new Date(today.setDate(today.getDate() - 30)); // Yesterday!

    const todayConvert = format.asString('yyyy-MM-dd hh:mm:ss', new Date());
    const lastWeekConvert = format.asString('yyyy-MM-dd hh:mm:ss', lastWeek);

    var data = JSON.stringify({
        "API-KEY": process.env.MOTASI_API,
        "TYPE": type, //CR or DB
        "BANK": bank,
        "NOREK": process.env.MOTASI_NOREK_OVO,
        "FROM_DATE": lastWeekConvert,
        "TO_DATE": todayConvert,
    });
    var config = {
        method: 'post',
        url: process.env.MOTASI_URL + 'cek_mutasi.php',
        headers: { 'Content-Type': 'application/json' },
        data: data
    };
    axios(config).then(function (response) {
        var data = response.data;

        const resultObject = search('1000', data.mutasi);
        console.log(resultObject)

        if (!resultObject) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Error',
            })
            return;
        }

        console.log(resultObject)

        transaction.findAll({
            // where: {  }
        })

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Thanks',
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

function search(nameKey, myArray) {
    for (let i = 0; i < myArray.length; i++) {
        if (myArray[i].nominal === nameKey) {
            return myArray[i];
        }
    }
}