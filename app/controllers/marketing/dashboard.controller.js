const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
const async = require('async')

var functions = require("../../../config/function");
const { events, eventsGuest, company, commission, masterEvent, regRegencies } = require("../../models/index.model");

exports.getDashboardData = (req, res) => {
    // console.log(req.userid);
    const fid_user = req.userid;
    // const fid_user = 1;
    const today = new Date();
    // console.log(new Date.now)

    async.parallel({
        dataCompany: function (callback) {
            company.findAndCountAll({ where: { fid_user: fid_user } })
                .then(data => callback(null, data))
        },
        dataEvents: function (callback) {
            events.findAndCountAll({ where: { fid_user: fid_user } })
                .then(data => callback(null, data))
        },
        dataGuest: function (callback) {
            eventsGuest.findAndCountAll({ where: { fid_user: fid_user } })
                .then(data => callback(null, data))
        },
        dataCommission: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, action: 'IN' },
                attributes: [
                    [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_in"],
                ],
            })
                .then(data => callback(null, data))
        },
        dataBalance: function (callback) {
            // console.log(dataCommission);
            commission.findAll({
                where: {
                    fid_user: fid_user,
                    status: 'SATTLE',
                },
                limit: 1,
                order: [['id', 'DESC']],
            })
                .then(data => callback(null, data))
        },
        dataEventLastMonth: function (callback) {
            events.findAll({
                where: {
                    fid_user: fid_user,
                    event_date: { [sequelize.Op.gte]: today },
                },
                attributes: ['id', 'banner', 'title', 'venue_name', 'invitation_limit', 'event_date'],
                limit: 5,
                order: [['event_date', 'ASC']],
                include: [
                    {
                        model: masterEvent,
                        attributes: ['title']
                    },
                    {
                        model: regRegencies,
                        attributes: ['name']
                    }
                ]
            })
                .then(data => callback(null, data))
        }
    }, function (err, results) {
        // console.log(results.dataCommission.dataValues.total_in);
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
                total_client: results.dataCompany.count,
                total_events: results.dataEvents.count,
                total_guest: results.dataGuest.count,
                total_commission: (results.dataCommission[0].dataValues.total_in == null) ? 0 : parseInt(results.dataCommission[0].dataValues.total_in),
                my_balance: results.dataBalance.length == 0 ? 0 : results.dataBalance[0].dataValues.balance,
                upcoming_event: results.dataEventLastMonth,
            }
        })
        return;
        // results now equals to: { task1: 1, task2: 2 }
    });
}