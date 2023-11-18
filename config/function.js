"use strict";
const axios = require("axios")
const dotenv = require('dotenv');
dotenv.config();
const fs = require("fs");

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
        url: process.env.WAPI_URL + process.env.WAPI_PATH_SEND_MSG,
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

module.exports.notificationWhatsAppWithImage = function auditLog(phone, imageURL, imageFilename, caption, next) {

    // const imageOri = process.env.MNT_PATH + 'event/thumbnail/' + data2[0].events_messages[0].image;
    var image = base64_encode(imageURL);

    var data = JSON.stringify({
        "api_key": process.env.WAPI_API,
        "device_key": process.env.WAPI_DEVICE,
        "destination": phone,
        "image": image,
        "filename": imageFilename,
        "caption": caption
    });
    var config = {
        method: 'post',
        url: process.env.WAPI_URL + process.env.WAPI_PATH_SEND_MSG_IMAGE,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: data
    };
    axios(config).then(function (response) {
        console.log('notification whatsapp for create user has been send');
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

module.exports.notificationWhatsAppWithLogo = function auditLog(phone, caption, next) {

    const imageOri = process.env.MNT_PATH + 'viseetor.jpg';
    var image = base64_encode(imageOri);

    var data = JSON.stringify({
        "api_key": process.env.WAPI_API,
        "device_key": process.env.WAPI_DEVICE,
        "destination": phone,
        "image": imageOri,
        "caption": caption
    });
    var config = {
        method: 'post',
        url: process.env.WAPI_URL + process.env.WAPI_PATH_SEND_MSG_IMAGE,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: data
    };
    axios(config).then(function (response) {
        console.log('notification whatsapp for create user has been send');
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

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}