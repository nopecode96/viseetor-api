const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
const async = require('async')

var functions = require("../../../config/function");
const { commission, masterBank, userProfile } = require("../../models/index.model");

exports.getCommissionList = (req, res) => {
    const fid_user = req.userid;
    const { page, size } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    var condition = {
        fid_user: fid_user,
        status: 'SATTLE'
    }

    async.parallel({
        totalIn: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, action: 'IN', status: 'SATTLE' },
                attributes: [
                    [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_in"],
                ],
            }).then(data => callback(null, data))
        },
        totalOut: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, action: 'OUT', status: 'SATTLE' },
                attributes: [
                    [sequelize.fn("SUM", sequelize.cast(sequelize.col("nominal"), 'integer')), "total_out"],
                ],
            }).then(data => callback(null, data))
        },
        balance: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, status: 'SATTLE' },
                limit: 1,
                order: [['id', 'DESC']],
            }).then(data => callback(null, data))
        },
        dataCommission: function (callback) {
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
        const balance = results.balance[0].dataValues.balance ?? 0

        console.log(totalIn);

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dashboard: {
                    totalIn: totalIn,
                    totalOut: totalOut,
                    balance: balance
                },
                datas: results.dataCommission
            }
        })
        return;
    })
}

exports.getWidrawalPage = (req, res) => {
    const fid_user = req.userid;

    async.parallel({
        balance: function (callback) {
            commission.findAll({
                where: { fid_user: fid_user, status: 'SATTLE' },
                limit: 1,
                order: [['id', 'DESC']],
            }).then(data => callback(null, data))
        },
        userBankAccount: function (callback) {
            userProfile.findAll({
                where: { fid_user: fid_user },
                limit: 1,
                attributes: ['fid_user', 'bank_account_number', 'bank_account_name'],
                include: {
                    model: masterBank,
                    attributes: ['id', 'title']
                }
            }).then(data => callback(null, data))
        }
    }, function (err, results) {
        if (err) {
            res.status(505).send({
                code: 505,
                success: false,
                message: err.message,
            })
            return;
        }
        const balance = results.balance[0].dataValues.balance ?? 0

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {

                balance: balance,
                userBankAccount: results.userBankAccount[0],

            }
        })
        return;
    })
}

