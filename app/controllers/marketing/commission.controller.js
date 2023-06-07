const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");

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
    const { user_id, page, size } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    var condition = {
        fid_user: user_id
    }

    commission.findAndCountAll({
        where: condition, limit, offset,
        order: [['id', 'DESC']],
    })
        .then(data => {
            const response = functions.getPagingData(data, page, limit);
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: response
            });

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
}
