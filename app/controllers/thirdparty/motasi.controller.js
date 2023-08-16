const db = require("../../models/index.model");
const sequelize = require('sequelize');
const axios = require("axios")
const format = require('date-format');

var functions = require("../../../config/function");
const { transaction } = require("../../models/index.model");
const { generateHmac } = require('../../utils/encrypt');
const { TRANSACTION_STATUS } = require("../../constants");

exports.webhook = async (req, res) => {
    const { logger } = req.app.locals;

    const signatureHeader = (req.headers['x-motasi-signature']).trim();

    logger.info(`Motasi signature Header: ${signatureHeader}`)
    
    // php 
    // $signature = hash_hmac('sha256', req.body, base64_encode($uid.':'.$json_body));  algo, data, key

    const secretKey = (Buffer.from(`${req.body.uid}:${JSON.stringify(req.body)}`)).toString('base64');
    const signature = generateHmac('sha256', JSON.stringify(req.body), secretKey);

    logger.info(`signature: ${signature}`)

    if (signature != signatureHeader) {
        return res.status(403).send({
            code: 403,
            success: false,
            message: `Signature doesn't match`
        })
    }

    const noteArr = ((req.body.note).trim()).split(' ');

    const findNoteHashtag = noteArr.find(note => {
        return note.startsWith('#');
    });

    if (!findNoteHashtag) {
        return res.status(406).send({
            code: 406,
            success: false,
            message: 'Nothing to update Transaction, Order number must exists on note',
        })
    }

    const orderNum = findNoteHashtag.substring(1);

    try {
        const updateTrx = await transaction.update({ status: TRANSACTION_STATUS.PAID }, {
            where: {
                order_number: orderNum
            }
        });

        if (updateTrx[0] == 0) {
            logger.error(`[DB] Transaction with order_number ${orderNum} not found`);
            return res.status(404).send({
                code: 404,
                success: false,
                message: 'Transaction not found',
            })
        }

        return res.status(200).send({
            code: 200,
            success: true,
            message: 'Thanks',
        });

    } catch (err) {
        logger.error(err);
        return res.status(500).send({
            code: 500,
            success: false,
            message: 'Update Database error',
        })
    }
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