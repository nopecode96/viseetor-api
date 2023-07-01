const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');

var functions = require("../../../config/function");
const { user, userProfile, commission, commissionWithdraw } = require("../../models/index.model");

exports.getWithdrawalList = (req, res) => {
    const { page, size, status, wd_number, user_email } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (status && wd_number && user_email) {
        var condition = {
            wd_number: wd_number,
            status: status
        }
        var condition2 = {
            email: user_email,
        }
    } else if (status && wd_number) {
        var condition = {
            wd_number: wd_number,
            status: status
        }
    } else if (wd_number && user_email) {
        var condition = {
            wd_number: wd_number,
            status: status
        }
        var condition2 = {
            email: user_email,
        }
    } else if (status && user_email) {
        var condition = {
            status: status
        }
        var condition2 = {
            email: user_email,
        }
    } else if (wd_number) {
        var condition = {
            wd_number: wd_number
        }
    } else if (user_email) {
        var condition2 = {
            email: user_email,
        }
    } else if (status) {
        var condition = {
            status: status
        }
    }

    commissionWithdraw.findAndCountAll({
        where: condition, limit, offset,
        include: {
            model: user,
            where: condition2,
            attributes: ['id', 'username', 'name', 'photo', 'email'],
            include: [
                {
                    model: userProfile,
                    attributes: ['phone_number', 'gender']
                },
                {
                    model: commission,
                    attributes: ['balance'],
                    limit: 1,
                    order: [['id', 'DESC']]
                }
            ]
        }

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

exports.withdrawUpdateSuccess = (req, res) => {
    const { wd_number } = req.query;

    commissionWithdraw.findAll({
        where: { wd_number: wd_number, status: 'REQUESTED' }
    }).then(data => {
        // console.log(data)
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data Not Found or already Sattlement/Rejected!',
                // data: response
            })
            return;
        }

        const nominals = data[0].nominal;
        const fid_user = data[0].fid_user;

        commission.findAll({
            where: { fid_user: fid_user, status: 'SATTLE' },
            limit: 1,
            order: [['id', 'DESC']]
        }).then(data2 => {
            const balance_existing = data2[0].balance;
            const balancex = parseFloat(balance_existing);
            const nominalx = parseFloat(nominals);

            if (nominalx > balancex) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Your balance not enough, please check your nominal!',
                })
                return;
            }

            const description = 'Withdrawal from WD No. #' + wd_number;
            const nominal = nominals;
            const balance = balancex - nominalx;
            const action = 'OUT';
            const status = 'SATTLE';
            // const fid_user = fid_user;

            commission.create({ description, nominal, balance, action, status, fid_user })
                .then(data3 => {
                    // console.log("data3")
                    // console.log(data3)
                    if (!data3) {
                        res.status(200).send({
                            code: 200,
                            success: false,
                            message: 'Cant create transaction!',
                        })
                        return;
                    }

                    commissionWithdraw.update({ status: 'SATTLE' }, {
                        where: { wd_number: wd_number }
                    }).then(data4 => {
                        // console.log("data4")
                        console.log(data4)
                        if (data[0] == 0) {
                            res.status(200).send({
                                code: 200,
                                success: false,
                                message: 'Withdrawal No. ' + wd_number + ' status cant update!'
                            })
                            return;
                        } else {
                            res.status(200).send({
                                code: 200,
                                success: false,
                                message: 'Withdrawal No. ' + wd_number + ' has been Sattlement!'
                            })
                            return;
                        }
                    })
                })
        })

    })
}

exports.withdrawUpdateReject = (req, res) => {
    const fid_user = req.userid;
    const { wd_number } = req.query;
    // console.log(wd_number)

    commissionWithdraw.findAll({
        where: { wd_number: wd_number }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data Not Found',
                data: response
            })
            return;
        }

        const tableid = data[0].id;

        commissionWithdraw.update({ status: 'REJECTED' }, {
            where: { wd_number: wd_number, status: 'REQUESTED' }
        }).then(data => {

            if (data[0] == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Withdrawal No. ' + wd_number + ' already Rejected, please find other number!'
                })
                return;
            } else {
                functions.auditLog('PUT', 'Reject Withdrawal for WD Number ' + wd_number, 'Any', 'commissionWithdraw', tableid, fid_user)
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: 'Withdrawal No. ' + wd_number + ' has been Rejected!'
                })
                return;
            }
        })
    })
}

