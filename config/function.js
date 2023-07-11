"use strict";
const async = require('async')
const axios = require("axios")
const dotenv = require('dotenv');
dotenv.config();

module.exports.getPagination = function getPagination(page, size) {
    const limit = size ? +size : 10;
    const offset = page ? page * limit : 0;

    return { limit, offset };
};

module.exports.getPagingData = function getPagingData(data, page, limit) {
    const { count: totalItems, rows: datas } = data;
    const currentPage = page ? +page : 1;
    const totalPages = Math.ceil(totalItems / limit);

    return { totalItems, datas, totalPages, currentPage };
}

module.exports.auditLog = function auditLog(action, description, user_agent, module, table_id, fid_user, next) {
    const { auditLogAdmin, transaction } = require("../app/models/index.model");

    auditLogAdmin.create({ action, description, user_agent, module, table_id, fid_user })
        .then(data => {
            next;
        })
}

module.exports.notificationWhatsApp = function auditLog(phone, message, next) {

    var data = JSON.stringify({
        "api_key": process.env.WAPI_API,
        "device_key": process.env.WAPI_DEVICE,
        "destination": phone,
        "message": message,
    });
    var config = {
        method: 'post',
        url: process.env.WAPI_URL + 'send-message',
        headers: { 'Content-Type': 'application/json' },
        data: data
    };
    axios(config).then(function (response) {
        console.log('notification for create user has been send');
        console.log(response.data);
        if (response.data.status !== "ok") {
            res.status(200).send({
                code: 1005,
                success: false,
                message: response.data.message
            });
            return;
        }

        next;

    }).catch(function (error) {
        console.log(error);
        res.status(200).send({
            code: 200,
            success: false,
            message: error,
        });
        return;
    });
}

module.exports.checkMotasiBankTransaction = function (transactionType, bank, next) {
    const today = new Date(); // Today!
    const yesterday = d.setDate(d.getDate() - 1); // Yesterday!

    var data = JSON.stringify({
        "API-KEY": process.env.MOTASI_API,
        "TYPE": transactionType, //CR or DB
        "BANK": bank,
        "NOREK": process.env.MOTASI_NOREK_OVO,
        "FROM_DATE": yesterday,
        "TO_DATE": today,
    });
    var config = {
        method: 'post',
        url: process.env.MOTASI_URL + 'cek_mutasi.php',
        headers: { 'Content-Type': 'application/json' },
        data: data
    };
    axios(config).then(function (response) {
        console.log('notification for create user has been send');
        console.log(response);
        if (response.code !== 200) {
            res.status(200).send({
                code: 1005,
                success: false,
                message: response.data.message
            });
            return;
        }

        next;

    }).catch(function (error) {
        console.log(error);
        res.status(400).send({
            code: 400,
            success: false,
            message: error,
        });
        return;
    });
}