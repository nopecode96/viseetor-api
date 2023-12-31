const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
const async = require('async');
var randomstring = require("randomstring");

var functions = require("../../../config/function");
const { commission, masterBank, userProfile, commissionWithdraw } = require("../../models/index.model");

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
            res.status(400).send({
                code: 400,
                success: false,
                message: err.message,
            })
            return;
        }
        // console.log(results.totalIn);
        const totalIn = results.totalIn[0].dataValues.total_in == null ? 0 : results.totalIn[0].dataValues.total_in;
        const totalOut = results.totalOut[0].dataValues.total_out == null ? 0 : results.totalOut[0].dataValues.total_out;
        const balance = results.balance.length == 0 ? 0 : results.balance[0].balance;

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

exports.getWidrawalList = (req, res) => {
    const fid_user = req.userid;
    const { page, size } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    var condition = {
        fid_user: fid_user
    }

    commissionWithdraw.findAndCountAll({
        where: condition, limit, offset,
    }).then(data => {
        // console.log(data);
        const response = functions.getPagingData(data, page, limit);
        // console.log(response);
        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: response
        })
        return;
    }).catch(err => {
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
        return;
    });
}

exports.getWidrawalCreatePage = (req, res) => {
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
            res.status(400).send({
                code: 400,
                success: false,
                message: err.message,
            })
            return;
        }
        console.log(results.userBankAccount[0].bank_account_number)
        // const balance = 0;
        if (results.userBankAccount[0].bank_account_number === null) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Please update your profile detail!',
                data: {
                    balance: 0,
                    userBankAccount: {
                        fid_user: 0,
                        bank_account_number: 0,
                        bank_account_name: '',
                        master_bank: {
                            id: 0,
                            title: ''
                        }
                    }
                }
            })
            return;
        } else {
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
        }
    })
}

exports.WidrawalCreate = (req, res) => {
    const fid_user = req.userid;
    const status = 'REQUESTED';
    const wd_number = randomstring.generate({
        length: 8,
        capitalization: 'uppercase'
    });

    const { nominal, bank_name, bank_account_name, bank_account_number } = req.body;

    commission.findAll({
        where: { fid_user: fid_user, status: 'SATTLE' },
        limit: 1,
        order: [['id', 'DESC']],
    }).then(data => {
        const balancex = parseFloat(data[0].balance);
        const nominalx = parseFloat(nominal);

        if (nominalx < 50000) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Sorry, minimum withdrawal is Rp.50,000!',
            })
            return;
        }



        if (nominalx > balancex) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Your balance not enough, please check your nominal!',
            })
            return;
        }

        commissionWithdraw.create({ wd_number, nominal, bank_name, bank_account_name, bank_account_number, status, fid_user })
            .then(data => {
                if (data.length == 0) {
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: "Insert data false.",
                        // insertID: data.order_number
                    });
                    return;
                }

                res.status(201).send({
                    code: 201,
                    success: true,
                    message: "Widthdrawal has been created.",
                    wd_number: data.wd_number
                });
                return;

            }).catch(err => {
                // console.log(err);
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err || "Some error occurred while retrieving data."
                });
                return;
            });
    })
}
