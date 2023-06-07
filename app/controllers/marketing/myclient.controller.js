const db = require("../../models/index.model");
const Company = db.company;
const sequelize = require('sequelize');
const fs = require('fs');
const async = require('async')

var functions = require("../../../config/function");
const { masterCompanyStatus, regProvincies, regRegencies, masterIndustry, eventsGuest, company, events } = require("../../models/index.model");

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
            })
                .then(data => callback(null, data))
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
            })
                .then(data => {
                    const response = functions.getPagingData(data, page, limit);
                    callback(null, response)
                })
        }
    }, function (err, results) {
        // console.log(results.dataCommission);
        if (err == 'null') {
            res.status(200).send({
                code: 200,
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
        // results now equals to: { task1: 1, task2: 2 }

    })
}

exports.getDetail = (req, res) => {
    const fid_user = req.userid;
    const { companyid } = req.query;

    var condition = {
        fid_user: fid_user,
        company_id: sequelize.where(sequelize.col('event.company.id'), companyid)
    }
    var condition2 = { id: companyid, fid_user: fid_user }

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
            })
                .then(data => callback(null, data))
        },
        totalEvent: function (callback) {
            events.findAndCountAll({
                where: { fid_company: companyid }
            })
                .then(data => callback(null, data))
        },
        dataDetail: function (callback) {
            company.findAll({
                where: condition2,
                include: [
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name'],
                        },
                    },
                    { model: masterIndustry, attributes: ['id', 'title'] },
                    { model: masterCompanyStatus, attributes: ['id', 'title'] }
                ],
            })
                .then(data => callback(null, data[0]))
        },
    }, function (err, results) {
        // console.log(results.dataCommission);
        if (err == 'null') {
            res.status(200).send({
                code: 200,
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
                total_guest: results.totalGuest.count,
                total_event: results.totalEvent.count,
                data_detail: results.dataDetail,
            }
        })
        return;
        // results now equals to: { task1: 1, task2: 2 }
    });
}

exports.getDetailEdit = (req, res) => {
    const fid_user = req.userid;
    const { companyid } = req.query;

    var condition = { id: companyid, fid_user: fid_user }

    async.parallel({
        mstIndustry: function (callback) {
            masterIndustry.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            })
                .then(data => callback(null, data))
        },
        mstStatus: function (callback) {
            masterCompanyStatus.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            })
                .then(data => callback(null, data))
        },
        mstStatus: function (callback) {
            masterCompanyStatus.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            })
                .then(data => callback(null, data))
        },
        mstRegency: function (callback) {
            regRegencies.findAll({
                attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
                include: {
                    model: regProvincies,
                    attributes: [],
                }
            })
                .then(data => callback(null, data))
        },
        dataDetail: function (callback) {
            company.findAll({
                where: condition,
                include: [
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name'],
                        },
                    },
                    { model: masterIndustry, attributes: ['id', 'title'] },
                    { model: masterCompanyStatus, attributes: ['id', 'title'] }
                ],
            })
                .then(data => callback(null, data[0]))
        },
    }, function (err, results) {
        // console.log(results.dataCommission);
        if (err == 'null') {
            res.status(200).send({
                code: 200,
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
                master_industry: results.mstIndustry,
                master_company_status: results.mstStatus,
                master_regency: results.mstRegency,
                data_detail: results.dataDetail,
            }
        })
        return;
        // results now equals to: { task1: 1, task2: 2 }
    });
}

exports.findAllRegional = (req, res) => {
    const { searchValue } = req.query;
    console.log(searchValue);
    var condition = {
        searchValue: sequelize.where(sequelize.fn('LOWER', sequelize.col('reg_regencie.name')), 'LIKE', '%' + searchValue + '%')
    }

    regRegencies.findAll(
        {
            where: condition,
            // attributes: [['id', 'value'], ['name', 'text']],
            attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
            include: {
                model: regProvincies,
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


//========
//========
//========
//========
//========


exports.createOne = (req, res) => {
    const { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status } = req.body;
    // console.log(req.body.file);
    const logo = req.file.filename;

    if (!title || !description || !address || !contact_person || !contact_phone || !fid_regencies || !fid_industry || !fid_user || !fid_company_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }
    // console.log(pass);

    Company.create({ title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status, logo })
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
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.createOneNoImage = (req, res) => {
    const { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status } = req.body;
    console.log(req.body);
    if (!title || !description || !address || !contact_person || !contact_phone || !fid_regencies || !fid_industry || !fid_user || !fid_company_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }
    // console.log(pass);

    Company.create({ title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status })
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
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.editOne = (req, res) => {
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

    Company.update(
        { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status },
        { where: { id: id } }
    )
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Edit data success."
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

exports.editOneWithImage = (req, res) => {
    const { id } = req.query;
    const { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status } = req.body;
    const logo = req.file.filename;

    if (!title || !description || !address || !contact_person || !contact_phone || !fid_regencies || !fid_industry || !fid_user || !fid_company_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    Company.update(
        { title, description, address, contact_person, contact_phone, fid_regencies, fid_industry, fid_user, fid_company_status, logo },
        { where: { id: id } }
    )
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Edit data success."
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
