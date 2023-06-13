const db = require("../../models/index.model");
// const Company = db.company;
const sequelize = require('sequelize');
const fs = require('fs');
const async = require('async')

var functions = require("../../../config/function");
const { masterCompanyStatus, regProvincies, regRegencies, masterIndustry, masterEvent, eventsGuest, company, events } = require("../../models/index.model");

exports.findMyClient = (req, res) => {
    const fid_user = req.userid;
    const { page, size, title, industry_id, statusid } = req.query;
    // console.log(req.query);
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title && industry_id && statusid) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_industry: industry_id, fid_company_status: statusid, fid_user: fid_user }
    } else if (title && industry_id) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_industry: industry_id, fid_user: fid_user }
    } else if (title && statusid) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_company_status: statusid, fid_user: fid_user }
    } else if (industry_id && statusid) {
        var condition = { fid_industry: industry_id, fid_company_status: statusid, fid_user: fid_user }
    } else if (title) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_user: fid_user }
    } else if (industry_id) {
        var condition = { fid_industry: industry_id, fid_user: fid_user }
    } else if (statusid) {
        var condition = { fid_company_status: statusid, fid_user: fid_user }
    } else {
        var condition = { fid_user: fid_user }
    }

    async.parallel({
        dataMstIndustry: function (callback) {
            masterIndustry.findAll({
                where: { published: true },
                attributes: ['id', 'title', 'published']
            }).then(data => callback(null, data))
        },
        dataCompany: function (callback) {
            company.findAndCountAll({
                where: condition, limit, offset,
                order: [['updatedAt', 'DESC']],
                include: [
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name'],
                        }
                    },
                    { model: masterIndustry, attributes: ['id', 'title'] },
                    { model: masterCompanyStatus, attributes: ['id', 'title'] }
                ]
            }).then(data => {
                const response = functions.getPagingData(data, page, limit);
                callback(null, response)
            })
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

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                data_mst_industry: results.dataMstIndustry,
                data_company: results.dataCompany,
            }
        })
        return;
    })
}

exports.getDetail = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const today = new Date();

    var condition = {
        fid_user: fid_user,
        company_id: sequelize.where(sequelize.col('event.company.id'), id)
    }
    var condition2 = { id: id, fid_user: fid_user }

    async.parallel({
        totalGuest: function (callback) {
            eventsGuest.findAndCountAll({
                where: condition,
                include: {
                    model: events,
                    include: {
                        model: company,
                        attributes: [['id', 'company_id']],
                    }
                }
            }).then(data => callback(null, data))
        },
        totalEvent: function (callback) {
            events.findAndCountAll({
                where: { fid_company: id }
            })
                .then(data => callback(null, data))
        },
        dataEventLastMonth: function (callback) {
            events.findAll({
                where: {
                    fid_user: fid_user,
                    fid_company: id,
                    event_date: { [sequelize.Op.gte]: today },
                },
                attributes: ['id', 'banner', 'title', 'venue_name', 'invitation_limit', 'event_date'],
                // limit: 5,
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
            }).then(data => callback(null, data))
        },
        dataDetail: function (callback) {
            company.findAll({
                where: condition2,
                attributes: ['id', 'title', 'logo', 'description', 'address', 'contact_person', 'contact_phone', 'updatedAt'],
                include: [
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name'],
                        },
                    },
                    {
                        model: masterIndustry,
                        attributes: ['id', 'title']
                    },
                    {
                        model: masterCompanyStatus,
                        attributes: ['id', 'title']
                    }
                ],
            })
                .then(data => callback(null, data))
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

        if (results.dataDetail.length == 0) {
            res.status(404).send({
                code: 404,
                success: false,
                message: 'Data not found',
            })
            return;
        }
        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                totalGuest: results.totalGuest.count,
                totalEvent: results.totalEvent.count,
                upcoming_event: results.dataEventLastMonth,
                datas: results.dataDetail[0],
            }
        })
        return;
    });
}

exports.getDetailEdit = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;

    var condition = { id: id, fid_user: fid_user }

    async.parallel({
        mstIndustry: function (callback) {
            masterIndustry.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        mstStatus: function (callback) {
            masterCompanyStatus.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        mstRegency: function (callback) {
            regRegencies.findAll({
                attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
                include: {
                    model: regProvincies,
                    attributes: [],
                }
            }).then(data => callback(null, data))
        },
        dataDetail: function (callback) {
            company.findAll({
                where: condition,
                attributes: ['id', 'title', 'logo', 'description', 'address', 'contact_person', 'contact_phone', 'updatedAt'],
                include: [
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name'],
                        },
                    },
                    {
                        model: masterIndustry,
                        attributes: ['id', 'title']
                    },
                    {
                        model: masterCompanyStatus,
                        attributes: ['id', 'title']
                    }
                ],
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
        if (results.dataDetail.length == 0) {
            res.status(404).send({
                code: 404,
                success: false,
                message: 'Data not found',
            })
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dataIndustry: results.mstIndustry,
                dataStatus: results.mstStatus,
                dataRegency: results.mstRegency,
                datas: results.dataDetail[0],
            }
        })
        return;
    });
}

exports.pageCreate = (req, res) => {
    async.parallel({
        mstIndustry: function (callback) {
            masterIndustry.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        mstStatus: function (callback) {
            masterCompanyStatus.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        mstRegency: function (callback) {
            regRegencies.findAll({
                attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
                include: {
                    model: regProvincies,
                    attributes: [],
                }
            }).then(data => callback(null, data))
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
        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dataIndustry: results.mstIndustry,
                dataStatus: results.mstStatus,
                dataRegency: results.mstRegency,
            }
        })
        return;
        // results now equals to: { task1: 1, task2: 2 }
    });
}

exports.create = (req, res) => {
    const fid_user = req.userid;
    const { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_company_status } = req.body;

    if (!title || !description || !address || !contact_person || !contact_phone || !fid_regencies || !fid_industry || !fid_company_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    if (!req.file) {
        company.create({ title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status })
            .then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Create data success."
                });
                return;
            })
            .catch(err => {
                console.log(err);
                res.status(505).send({
                    code: 505,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
            });
    } else {
        const logo = req.file.filename;
        company.create({ title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status, logo })
            .then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Create data success."
                });
                return;
            })
            .catch(err => {
                console.log(err);
                res.status(505).send({
                    code: 505,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
            });
    }
}

exports.update = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { fid_company_status } = req.body;

    if (!fid_user || !fid_company_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    company.update(
        { fid_user, fid_company_status },
        { where: { id: id } }
    ).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Edit data success."
        });
        return;
    }).catch(err => {
        res.status(505).send({
            code: 505,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}

exports.updateStatus = (req, res) => {
    const { id } = req.query;
    const { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status } = req.body;

    if (!title || !description || !address || !contact_person || !contact_phone || !fid_regencies || !fid_industry || !fid_user || !fid_company_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    if (!req.file) {
        company.update(
            { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status },
            { where: { id: id } }
        ).then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Edit data success."
            });
            return;
        }).catch(err => {
            console.log(err);
            res.status(505).send({
                code: 505,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
    } else {
        company.update(
            { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status, logo },
            { where: { id: id } }
        ).then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Edit data success."
            });
            return;
        }).catch(err => {
            console.log(err);
            res.status(505).send({
                code: 505,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
    }
}