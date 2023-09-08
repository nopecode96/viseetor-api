const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');
var randomstring = require("randomstring");
const async = require('async');
const ejs = require('ejs');
const path = require('path');


var functions = require("../../../config/function");
const { user, masterPrice, promotion, transaction, events, company, userProfile, regRegencies, regProvincies, userType, masterBankPayment } = require("../../models/index.model");

exports.getTransactions = (req, res) => {
    const fid_user = req.userid;
    const { page, size, order_number, status } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);
    console.log(order_number);
    if (order_number && status) {
        var condition = {
            order_number: order_number,
            // order_number: sequelize.where(sequelize.fn('LOWER', sequelize.col('order_number')), 'LIKE', '%' + order_number + '%'),
            status: status,
            fid_user: fid_user
        }
    } else if (status) {
        var condition = {
            status: status,
            fid_user: fid_user
        }
    } else if (order_number) {
        var condition = {
            order_number: order_number,
            // order_number: sequelize.where(sequelize.fn('LOWER', sequelize.col('order_number')), 'LIKE', '%' + order_number + '%'),
            fid_user: fid_user
        }
    } else {
        var condition = {
            fid_user: fid_user
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

        ]
    })
        .then(data => {
            const response = functions.getPagingData(data, page, limit);
            // console.log(response);
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: response
            });
        })
        .catch(err => {
            // console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });

}

exports.getDetail = (req, res) => {
    const { orderno } = req.query;
    // console.log(orderno)
    if (!orderno) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    transaction.findAll({
        where: { order_number: orderno, published: true },
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
            // console.log(data.length)
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Datas Not Found.",
                    // data: data[0]
                });
                return;
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data[0]
            });
            return;
        })
        .catch(err => {
            console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.createTransactionPage = (req, res) => {
    const fid_user = req.userid;

    async.parallel({
        masterPrice: function (callback) {
            masterPrice.findAll({
                where: { published: true },
                order: [
                    ['id', 'ASC'],
                ],
                attributes: ['id', 'title', 'description', 'limit_min', 'limit_max', 'unit_price', 'commission']
            }).then(data => callback(null, data))
        },
        dataEvents: function (callback) {
            events.findAll({
                where: { fid_user: fid_user },
                attributes: ['id', 'title'],
                include: {
                    model: company,
                    where: { fid_company_status: 1 }
                }
            }).then(data => callback(null, data))
        },
        paymentBank: function (callback) {
            masterBankPayment.findAll({
                where: { published: true },
                attributes: ['id', 'bank', 'account_number', 'account_name']
                // attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('bank'), ' | ', sequelize.col('account_number'), ' | ', sequelize.col('account_name')), 'text']],
            }).then(data => callback(null, data))
        },

    }, function (err, results) {
        // console.log(results.dataCommission);
        if (err) {
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
                masterPrice: results.masterPrice,
                dataEvents: results.dataEvents,
                paymentBank: results.paymentBank,
            }
        })
        return;
    })
}

exports.getPriceOne = (req, res) => {
    const { qty } = req.query;
    // console.log(qty);

    if (!qty) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Datas Not Found.",
            // data: data[0]
        });
        return;
    }

    masterPrice.findAll({
        where: {
            limit_min: { [Op.lte]: qty },
            limit_max: { [Op.gte]: qty }
        }
        // attributes: [[sequelize.fn('min', sequelize.col('price')), 'minPrice']],
    })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data[0]
            });
            return;
        })
        .catch(err => {
            // console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.getPromoCode = (req, res) => {
    const { code } = req.query;
    const datenow = new Date(Date.now());
    // console.log(datenow);

    var condition = {
        code: code,
        start_date: { [Op.lte]: datenow },
        end_date: { [Op.gte]: datenow },
        published: true
    }

    promotion.findAll({
        where: condition,
        attributes: ['id', 'title', 'description', 'code', 'discount'],
    })
        .then(data => {
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Datas Not Found.",
                    // data: data
                });
                return;
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data[0]
            });
            return;
        })
        .catch(err => {
            // console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.createTransaction = (req, res) => {
    const fid_user = req.userid;
    const { qty, fid_events, fid_price, fid_bank_payment, fid_promotion } = req.body;
    const { paymentService } = req.app.locals.services;
    const tax = process.env.TAX;
    const status = 'UNPAID';
    const published = true;


    const order_number = randomstring.generate({
        length: 10,
        capitalization: 'uppercase'
    });
    const unixcode = randomstring.generate({
        length: 3,
        charset: '123456789'
    });


    if (!order_number || !qty || !fid_events || !fid_price || !fid_bank_payment) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    masterPrice.findAll({
        where: {
            limit_min: { [Op.lte]: qty },
            limit_max: { [Op.gte]: qty }
        }
    }).then(data => {
        const unit_price = data[0].unit_price;
        const unit_commission = data[0].commission;
        const total_price = parseFloat(unit_price) * parseFloat(qty);
        const total_commission = parseFloat(unit_commission) * parseFloat(qty);
        // console.log(unit_commission);

        if (!fid_promotion) {
            const tax_nominal = parseFloat(total_price) * parseFloat(tax) / 100;
            const total_before_tax = parseFloat(total_price);

            // const total_payment = parseFloat(total_before_tax) + parseFloat(tax_nominal) + parseFloat(unixcode);
            const total_payment = parseFloat(total_before_tax) + parseFloat(tax_nominal);

            const discount_nominal = 0;
            const discount_percent = 0;

            transaction.create({ order_number, qty, unit_price, unit_commission, total_price, discount_percent, discount_nominal, total_before_tax, tax, tax_nominal, total_payment, total_commission, status, published, fid_events, fid_user, fid_bank_payment, fid_price })
                .then(async data => {
                    await paymentService.createClose(order_number);

                    res.status(201).send({
                        code: 201,
                        success: true,
                        message: "Add New Order Success.",
                        order_number: data.order_number
                    });
                })
                .catch(err => {
                    // console.log(err);
                    res.status(400).send({
                        code: 400,
                        success: false,
                        message:
                            err || "Some error occurred while retrieving data."
                    });
                });
        } else {
            promotion.findAll({
                where: { id: fid_promotion }
            }).then(data2 => {
                const discount_percent = data2[0].discount;
                const discount_nominal = parseFloat(total_price) * parseFloat(discount_percent) / 100;
                const total_before_tax = parseFloat(total_price) - parseFloat(discount_nominal);

                const tax_nominal = parseFloat(total_before_tax) * parseFloat(tax) / 100;

                // const total_payment = parseFloat(total_price) + parseFloat(tax_nominal) + parseFloat(unixcode);
                const total_payment = parseFloat(total_price) + parseFloat(tax_nominal);
                console.log(total_payment);
                transaction.create({ order_number, qty, unit_price, unit_commission, total_price, discount_percent, discount_nominal, total_before_tax, tax, tax_nominal, total_payment, total_commission, status, published, fid_promotion, fid_events, fid_user, fid_bank_payment, fid_price })
                    .then(async data => {
                        await paymentService.createClose(order_number);

                        res.status(201).send({
                            code: 201,
                            success: true,
                            message: "Add New Order Success.",
                            order_number: data.order_number
                        });
                    })
                    .catch(err => {
                        // console.log(err);
                        res.status(400).send({
                            code: 400,
                            success: false,
                            message:
                                err || "Some error occurred while retrieving data."
                        });
                    });
            })
        }
    })
}

exports.paymentConfirmation = async (req, res) => {
    const { order_number } = req.params;

    const { paymentService } = req.app.locals.services;

    const paymentInquiry = await paymentService.inquiry(order_number);

    return res.status(paymentInquiry.code).send(paymentInquiry);
}


// exports.getPromotionAll = (req, res) => {
//     const datenow = new Date(Date.now());

//     const condition = {
//         start_date: { [Op.lte]: datenow },
//         end_date: { [Op.gte]: datenow },
//     }

//     promotion.findAll({
//         where: condition,
//         attributes: ['id', 'title', 'description', 'code', 'discount', 'start_date', 'end_date'],
//     }).then(data => {
//         res.status(200).send({
//             code: 200,
//             success: true,
//             message: "Datas Found.",
//             data: data
//         });
//         return;
//     }).catch(err => {
//         // console.log(err);
//         res.status(500).send({
//             code: 500,
//             success: false,
//             message:
//                 err.message || "Some error occurred while retrieving data."
//         });
//     });

// }

