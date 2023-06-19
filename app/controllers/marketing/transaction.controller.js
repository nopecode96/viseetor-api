const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');
var randomstring = require("randomstring");
const async = require('async')

var functions = require("../../../config/function");
const { user, masterPrice, promotion, transaction, events, company, userProfile, regRegencies, regProvincies, userType, masterBankPayment } = require("../../models/index.model");

exports.getPromotionAll = (req, res) => {
    const datenow = new Date(Date.now());

    const condition = {
        start_date: { [Op.lte]: datenow },
        end_date: { [Op.gte]: datenow },
    }

    promotion.findAll({
        where: condition,
        attributes: ['id', 'title', 'description', 'code', 'discount', 'start_date', 'end_date'],
    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: data
        });
        return;
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

exports.getTransactions = (req, res) => {
    const fid_user = req.userid;
    const { page, size, user_id, order_number, status } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (order_number && status) {
        var condition = {
            order_number: sequelize.where(sequelize.fn('LOWER', sequelize.col('order_number')), 'LIKE', '%' + order_number + '%'),
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
            order_number: sequelize.where(sequelize.fn('LOWER', sequelize.col('order_number')), 'LIKE', '%' + order_number + '%'),
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
            res.status(500).send({
                code: 500,
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
                res.status(404).send({
                    code: 404,
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
            res.status(500).send({
                code: 500,
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
                attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('bank'), ' | ', sequelize.col('account_number'), ' | ', sequelize.col('account_name')), 'text']],
            }).then(data => callback(null, data))
        },

    }, function (err, results) {
        // console.log(results.dataCommission);
        if (err) {
            res.status(505).send({
                code: 505,
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


exports.createTransaction = (req, res) => {
    const { qty, unit_price, unit_commission, total_price, total_payment, total_commission, discount_percent, discount_nominal, status, published, fid_events, fid_user, fid_bank_payment, fid_promotion, fid_price } = req.body;
    console.log(req.body);
    const tax = 0;
    const order_number = randomstring.generate({
        length: 8,
        capitalization: 'uppercase'
    });

    if (!order_number || !qty || !unit_price || !unit_commission || !total_price || !total_payment || !total_commission || !fid_events || !fid_price || !fid_bank_payment || !status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    if (fid_promotion == '') {
        transaction.create({ order_number, qty, unit_price, unit_commission, total_price, tax, discount_percent, discount_nominal, total_payment, total_commission, status, published, fid_events, fid_user, fid_bank_payment, fid_price })
            .then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Add New Order Success.",
                    insertID: data.order_number
                });
            })
            .catch(err => {
                // console.log(err);
                res.status(500).send({
                    code: 500,
                    success: false,
                    message:
                        err || "Some error occurred while retrieving data."
                });
            });
    } else {
        transaction.create({ order_number, qty, unit_price, unit_commission, total_price, tax, discount_percent, discount_nominal, total_payment, total_commission, status, published, fid_events, fid_user, fid_bank_payment, fid_promotion, fid_price })
            .then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Add New Order Success.",
                    insertID: data.order_number
                });
            })
            .catch(err => {
                // console.log(err);
                res.status(500).send({
                    code: 500,
                    success: false,
                    message:
                        err || "Some error occurred while retrieving data."
                });
            });
    }


}

exports.paymentConfirmation = (req, res) => {

}

exports.getPriceAll = (req, res) => {
    masterPrice.findAll({
        order: [['id', 'ASC']],
    })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data
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

exports.getPriceOne = (req, res) => {
    const { qty } = req.query;
    // console.log(qty);

    if (!qty) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Datas Found.",
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
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.getPromoCode = (req, res) => {
    const { code } = req.query;
    const datenow = new Date(Date.now());
    console.log(datenow);

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
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.findAllEvent = (req, res) => {
    const { searchValue } = req.query;
    // console.log(searchValue);
    var condition = {
        searchValue: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + searchValue + '%')
    }

    events.findAll(
        {
            where: condition,
            // attributes: [['id', 'value'], ['name', 'text']],
            attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('events.title'), ', ', sequelize.col('company.title')), 'text']],
            include: {
                model: company,
                attributes: [],
            }
        },
    )
        .then(data => {
            // console.log(data);
            res.send(data);
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.paymentBank = (req, res) => {
    masterBankPayment.findAll(
        {
            attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('bank'), ' | ', sequelize.col('account_number'), ' | ', sequelize.col('account_name')), 'text']],
        },
    )
        .then(data => {
            // console.log(data);
            res.send(data);
        })
        .catch(err => {
            console.log(err.message);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}
