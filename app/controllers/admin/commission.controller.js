const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');

var functions = require("../../../config/function");
const { user, userProfile, commission, commissionWithdraw } = require("../../models/index.model");

exports.getWithdrawalList = (req, res) => {
    const { page, size, status } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (status) {
        var condition = {
            status: status
        }
    }

    commissionWithdraw.findAndCountAll({
        where: condition, limit, offset,
        include: {
            model: user,
            attributes: ['id', 'username', 'name', 'photo'],
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
    const { wd_number } = req.body;

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

        const nominal = data[0].nominal;
        // console.log(nominal);
        commission.update({

        })
    })
}

exports.withdrawUpdateReject = (req, res) => {
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

        commissionWithdraw.update({ status: 'REJECTED' }, {
            where: { wd_number: wd_number }
        }).then(data => {

            res.status(200).send({
                code: 200,
                success: true,
                message: 'Withdrawal No. ' + wd_number + ' has been Rejected!'
            })
            return;
        })
    })
}

