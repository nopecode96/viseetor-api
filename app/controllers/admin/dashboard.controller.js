const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');
const async = require('async')

var functions = require("../../../config/function");
const { user, events, eventsGuest, userProfile, commission, commissionWithdraw } = require("../../models/index.model");

exports.getDataDashboard = (req, res) => {

    async.parallel({
        totalMarketing: function (callback) {
            user.findAndCountAll({ where: { fid_user_type: 2 } })
                .then(data => callback(null, data))
        },
        totalSpv: function (callback) {
            user.findAndCountAll({ where: { fid_user_type: 3 } })
                .then(data => callback(null, data))
        },
        totalEvent: function (callback) {
            events.findAndCountAll()
                .then(data => callback(null, data))
        },
        totalGuest: function (callback) {
            eventsGuest.findAndCountAll()
                .then(data => callback(null, data))
        },
        growthRegisteredMarketing: function (callback) {
            user.findAll({
                where: { fid_user_type: 2 },
                attributes: [
                    [Sequelize.fn('date_trunc', 'month', sequelize.col("createdAt")), "month"],
                    [Sequelize.fn("count", "*"), 'amount'],
                ],
                // order: [['createdAt', 'DESC']],
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
                order: [[sequelize.col("month"), "ASC"]],
                limit: 5
            }).then(data => callback(null, data))
        },
        growthRegisteredSupervisor: function (callback) {
            user.findAll({
                where: { fid_user_type: 3 },
                attributes: [
                    [Sequelize.fn('date_trunc', 'month', sequelize.col("createdAt")), "month"],
                    [Sequelize.fn("count", "*"), 'amount'],
                ],
                // order: [['createdAt', 'DESC']],
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
                order: [[sequelize.col("month"), "ASC"]],
                limit: 5
            }).then(data => callback(null, data))
        },
        growthEvent: function (callback) {
            events.findAll({
                // where: { fid_user_type: 3 },
                attributes: [
                    [Sequelize.fn('date_trunc', 'month', sequelize.col("event_date")), "month"],
                    [Sequelize.fn("count", "*"), 'amount'],
                ],
                // order: [['createdAt', 'DESC']],
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('event_date'))],
                order: [[sequelize.col("month"), "ASC"]],
                limit: 5
            }).then(data => callback(null, data))
        },
        growthEventGuest: function (callback) {
            eventsGuest.findAll({
                // where: { fid_user_type: 3 },
                attributes: [
                    [Sequelize.fn('date_trunc', 'month', sequelize.col("createdAt")), "month"],
                    [Sequelize.fn("count", "*"), 'amount'],
                ],
                // order: [['createdAt', 'DESC']],
                group: [sequelize.fn('date_trunc', 'month', sequelize.col('createdAt'))],
                order: [[sequelize.col("month"), "ASC"]],
                limit: 5
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
                total: {
                    totalMarketing: results.totalMarketing.count,
                    totalSpv: results.totalSpv.count,
                    totalEvent: results.totalEvent.count,
                    totalEventGuest: results.totalGuest.count,
                },
                graphic: {
                    dataGrowthRegisteredMarketing: results.growthRegisteredMarketing,
                    dataGrowthRegisteredSpv: results.growthRegisteredSupervisor,
                    dataGrowthEvents: results.growthEvent,
                }

            }
        })
        return;
    })


}