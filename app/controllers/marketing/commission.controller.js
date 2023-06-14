const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
const async = require('async')

var functions = require("../../../config/function");
const { commission, events, eventsGallery, eventsGiftBank, eventsGuest, eventsTicketing, eventsWedding, company, regRegencies, regProvincies, masterEvent } = require("../../models/index.model");

exports.getTotalBoard = (req, res) => {
    const { user_id } = req.query;

    commission.findAll({
        where: { fid_user: user_id },
        limit: 1,
        order: [['id', 'DESC']],
    })
        .then(data => {
            const balances = data.balance;
            commission.findAll({
                where: { fid_user: user_id, action: 'IN' },
                attributes: [
                    [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_in"],
                ],
            })
                .then(data1 => {
                    const balance = balances;
                    const totalIn = data1[0].dataValues.total_in;
                    commission.findAll({
                        where: { fid_user: user_id, action: 'OUT' },
                        attributes: [
                            [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_out"],
                        ],
                    })
                        .then(data2 => {
                            const totalOut = data2[0].dataValues.total_out;
                            // console.log(data2[0].balance)
                            // console.log(data2[0].balance);

                            res.status(200).send({
                                code: 200,
                                success: true,
                                message: "Datas Found.",
                                data: {
                                    total_in: totalIn == null ? 0 : parseInt(totalIn),
                                    total_out: totalOut == null ? 0 : parseInt(totalOut),
                                    balance: balance == null ? 0 : balance
                                }
                            });
                        })

                })
                .catch(err => {
                    // console.log(err);
                    res.status(500).send({
                        code: 500,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
}

exports.getCommissionList = (req, res) => {
    const fid_user = req.userid;
    const { page, size } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    var condition = {
        fid_user: fid_user
    }

    async.parallel({
        totalIn: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, action: 'IN' },
                attributes: [
                    [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_in"],
                ],
            }).then(data => callback(null, data))
        },
        totalOut: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, action: 'OUT' },
                attributes: [
                    [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_out"],
                ],
            }).then(data => callback(null, data))
        },
        balance: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user },
                limit: 1,
                order: [['id', 'DESC']],
            }).then(data => callback(null, data))
        },
        balance: function (callback) {
            commission.findAndCountAll({
                where: condition, limit, offset,
                order: [['id', 'DESC']],
            }).then(data => {
                const response = functions.getPagingData(data, page, limit);
                callback(null, response)
            })
        },
    }, function (err, results) {
        if (err) {
            res.status(505).send({
                code: 505,
                success: false,
                message: err.message,
            })
            return;
        }
        const totalIn = results.totalIn[0].dataValues.total_in ?? 0
        const totalOut = results.totalOut[0].dataValues.total_out ?? 0
        const balance = results.totalOut[0].dataValues.total_out ?? 0

        console.log(totalIn);

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dashboard: {
                    totalIn: totalIn,
                    totalOut: totalOut,
                },
                datas: results
            }
        })
        return;

    })



}
