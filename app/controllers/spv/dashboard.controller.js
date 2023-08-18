const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")
var randomstring = require("randomstring");

var functions = require("../../../config/function");
const { user, company, events, userProfile, userType, masterUserStatus, regRegencies, regProvincies, masterBank, masterOccupation, eventsGuest } = require("../../models/index.model");

exports.getDataDashboard = (req, res) => {
    const parent_id = req.userid;
    console.log(parent_id)

    async.parallel({
        totalMyUser: function (callback) {
            user.findAndCountAll({ where: { parent_id: parent_id } })
                .then(data => callback(null, data))
        },
        totalCLient: function (callback) {
            company.findAndCountAll({
                where: { fid_company_status: 1 },
                include: {
                    model: user,
                    where: { parent_id: parent_id }
                }
            }).then(data => callback(null, data))
        },
        totalEvent: function (callback) {
            events.findAndCountAll({
                // where: { fid_status: 1 },
                include: {
                    model: user,
                    where: { parent_id: parent_id }
                }
            }).then(data => callback(null, data))
        },
        totalGuest: function (callback) {
            eventsGuest.findAndCountAll({
                // where: { fid_status: 1 },
                include: {
                    model: user,
                    where: { parent_id: parent_id }
                }
            }).then(data => callback(null, data))
        },
    }, function (err, results) {
        if (err == 'null') {
            res.status(400).send({
                code: 400,
                success: false,
                message: err.message,
            })
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                total_marketing: results.totalMyUser.count,
                total_client: results.totalCLient.count,
                total_events: results.totalEvent.count,
                total_guest: results.totalGuest.count,
            }
        })
        return;
    })
}