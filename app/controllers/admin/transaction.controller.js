const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');

var functions = require("../../../config/function");
const { user, masterPrice, promotion, transaction, events, company, userProfile, regRegencies, regProvincies, userType, masterBankPayment, commission } = require("../../models/index.model");

exports.getTransactions = (req, res) => {
    const { page, size, order_number, status, user_email } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    console.log(order_number);

    if (order_number && status && user_email) {
        var condition = {
            // order_number: sequelize.where(sequelize.fn('LOWER', sequelize.col('order_number')), 'LIKE', '%' + order_number + '%'),
            order_number: order_number,
            status: status,
        }
        var condition2 = {
            email: user_email,
        }
    } else if (order_number && status) {
        var condition = {
            order_number: order_number,
            status: status,
        }
    } else if (status) {
        var condition = {
            status: status,
        }
    } else if (order_number) {
        var condition = {
            // order_number: sequelize.where(sequelize.fn('LOWER', sequelize.col('order_number')), 'LIKE', '%' + order_number + '%'),
            order_number: order_number,
        }
    } else if (user_email) {
        var condition2 = {
            email: user_email,
        }
    }

    transaction.findAndCountAll({
        where: condition, limit, offset,
        order: [['updatedAt', 'DESC']],
        include: [
            {
                model: events,
                attributes: ['title', 'event_date', 'invitation_limit'],
                include: {
                    model: company,
                    attributes: ['id', 'title']
                }
            },
            { model: masterPrice, attributes: ['id', 'title', 'limit_min', 'limit_max', 'commission'] },
            {
                model: user,
                where: condition2,
                attributes: ['id', 'name', 'email']
            }

        ]
    }).then(data => {
        const response = functions.getPagingData(data, page, limit);
        // console.log(response);
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: response
        });
    }).catch(err => {
        // console.log(err);
        res.status(500).send({
            code: 500,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}

exports.getDetail = (req, res) => {
    const { order_number } = req.query;
    if (!order_number) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    transaction.findAll({
        where: { order_number: order_number, published: true },
        include: [
            {
                model: events,
                attributes: ['title', 'event_date', 'invitation_limit', 'location_address'],
                include: [
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name']
                        }
                    },
                    {
                        model: company,
                        attributes: ['id', 'title', 'logo', 'address', 'contact_person', 'contact_phone'],
                        include: {
                            model: regRegencies,
                            attributes: ['id', 'name'],
                            include: {
                                model: regProvincies,
                                attributes: ['id', 'name']
                            }
                        }
                    }
                ]
            },

            {
                model: masterPrice,
                attributes: ['id', 'title', 'limit_min', 'limit_max', 'unit_price', 'commission']
            },
            {
                model: promotion,
                attributes: ['id', 'title', 'description', 'code', 'discount']
            },
            {
                model: user,
                attributes: ['id', 'name', 'email'],
                include: [
                    {
                        model: userProfile,
                        attributes: ['phone_number']
                    },
                    {
                        model: userType,
                        attributes: ['id', 'type_name']
                    }
                ]
            },
            {
                model: masterBankPayment,
                attributes: ['id', 'bank', 'account_number', 'account_name']
            }

        ]
    })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data[0]
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

exports.paymentReceived = (req, res) => {
    const fid_user = req.userid;
    const { order_number } = req.body;

    if (!order_number) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    transaction.findAll({
        where: { order_number: order_number },
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Transaction not found."
            });
            return;
        }
        // console.log(data[0].id)
        const fid_transaction = data[0].id;
        const fid_events = data[0].fid_events;
        // const fid_user = data[0].fid_user;
        const total_commission = data[0].total_commission;
        const qty = data[0].qty;

        transaction.update({ status: 'PAID' }, {
            where: { id: fid_transaction, fid_user: fid_user }
        }).then(data2 => {
            // console.log(data2);
            if (data2[0] == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Transaction not valid."
                });
                return;
            }

            events.findAll({ where: { id: fid_events } })
                .then(data3 => {
                    // console.log(total_commission);
                    const invitation_limit = data3[0].invitation_limit;
                    const new_invitation_limit = parseInt(invitation_limit) + parseInt(qty);
                    // console.log(new_invitation_limit);
                    events.update({ invitation_limit: new_invitation_limit }, { where: { id: fid_events } })
                        .then(data4 => {
                            commission.findAll({
                                where: { fid_user: fid_user },
                                limit: 1,
                                order: [['id', 'DESC']],
                            })
                                .then(data5 => {
                                    var balance = '0';
                                    if (data5.length == 0) {
                                        balance = '0';
                                    } else {
                                        balance = data5[0].balance;
                                    }

                                    const lastBalance = parseInt(total_commission) + parseInt(balance);

                                    commission.create({
                                        'description': 'Commission from Order No. #' + order_number,
                                        'nominal': total_commission,
                                        'balance': lastBalance,
                                        'action': 'IN',
                                        'status': 'SATTLE',
                                        'fid_user': fid_user,
                                        'fid_transaction': fid_transaction
                                    })
                                        .then(data6 => {
                                            res.status(200).send({
                                                code: 200,
                                                success: true,
                                                message: "Transaction Completed.",
                                                data: data6
                                            });
                                            return;
                                        })
                                })
                        })
                })
        })
    })
}
