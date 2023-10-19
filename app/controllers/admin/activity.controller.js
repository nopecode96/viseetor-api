const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');
const async = require('async')

var functions = require("../../../config/function");
const { user, userProfile, userType, company, masterEvent, events, eventsGuest, masterCompanyStatus, masterIndustry, regRegencies, regProvincies, eventsAppScan } = require("../../models/index.model");

exports.getClient = (req, res) => {
    const { page, size, title, industry_id, statusid } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title && industry_id && statusid) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_industry: industry_id, fid_company_status: statusid }
    } else if (title && industry_id) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_industry: industry_id }
    } else if (title && statusid) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%'), fid_company_status: statusid }
    } else if (industry_id && statusid) {
        var condition = { fid_industry: industry_id, fid_company_status: statusid }
    } else if (title) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + title + '%') }
    } else if (industry_id) {
        var condition = { fid_industry: industry_id }
    } else if (statusid) {
        var condition = { fid_company_status: statusid }
    } else {
        var condition = null
    }

    async.parallel({
        dataMstIndustry: function (callback) {
            masterIndustry.findAll({
                where: { published: true },
                attributes: ['id', 'title', 'published']
            }).then(data => callback(null, data))
        },
        dataMstStatus: function (callback) {
            masterCompanyStatus.findAll({
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
                    {
                        model: masterIndustry,
                        where: { published: true },
                        attributes: ['id', 'title']
                    },
                    { model: masterCompanyStatus, attributes: ['id', 'title'] },
                    {
                        model: user,
                        attributes: ['id', 'name', 'username'],
                        include: {
                            model: userType,
                            attributes: ['id', 'type_name']
                        }
                    },
                ]
            }).then(data => {
                const response = functions.getPagingData(data, page, limit);
                callback(null, response)
            })
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

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                data_mst_industry: results.dataMstIndustry,
                data_mst_status: results.dataMstStatus,
                data_company: results.dataCompany,
            }
        })
        return;
    })

}

exports.findEvents = (req, res) => {
    const today = new Date();

    const { page, size, title, typeid, upcoming } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title && typeid) {
        if (upcoming == true) {
            var condition = {
                event_date: { [sequelize.Op.gte]: today },
                title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
                fid_type: typeid,
            }
        } else {
            if (upcoming == true) {
                var condition = {
                    event_date: { [sequelize.Op.lte]: today },
                    title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
                    fid_type: typeid,
                }
            }
        }
    } else if (title) {
        if (upcoming == true) {
            var condition = {
                event_date: { [sequelize.Op.gte]: today },
                title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            }
        } else {
            var condition = {
                event_date: { [sequelize.Op.lte]: today },
                title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            }
        }
    } else if (typeid) {
        if (upcoming == true) {
            var condition = {
                event_date: { [sequelize.Op.gte]: today },
                fid_type: typeid,
            }
        } else {
            var condition = {
                event_date: { [sequelize.Op.lte]: today },
                fid_type: typeid,
            }
        }
    } else {
        if (upcoming == true) {
            var condition = {
                event_date: { [sequelize.Op.gte]: today },
            }
        } else {
            var condition = {
                event_date: { [sequelize.Op.lte]: today },
            }
        }
    }

    async.parallel({
        dataEventType: function (callback) {
            masterEvent.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        dataCompany: function (callback) {
            company.findAll({
                where: { fid_company_status: 1 },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        dataList: function (callback) {
            events.findAndCountAll({
                where: condition, limit, offset,
                order: [['updatedAt', 'DESC']],
                attributes: ['id', 'banner', 'title', 'venue_name', 'event_date', 'invitation_limit', 'published', 'gift_bank', 'updatedAt'],
                include: [
                    {
                        model: company,
                        where: { fid_company_status: 1 },
                        attributes: ['id', ['title', 'company_name'], 'fid_company_status']
                    },
                    {
                        model: masterEvent,
                        attributes: ['id', 'title']
                    },
                    {
                        model: regRegencies,
                        attributes: ['id', 'name'],
                        include: {
                            model: regProvincies,
                            attributes: ['id', 'name'],
                        }
                    },
                    {
                        model: user,
                        attributes: ['id', 'name'],
                        include: {
                            model: userType,
                            attributes: ['id', 'type_name']
                        }
                    }
                ]
            }).then(data => {
                const response = functions.getPagingData(data, page, limit);
                callback(null, response)
            })

        }
    }, function (err, results) {
        // console.log(results);
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
            data: results
        })
        return;
    })
}

exports.findGuest = (req, res) => {
    const { page, size, name } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (name) {
        var condition = {
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'),
        }
    } else {
        var condition = null
    }

    async.parallel({
        dataGuestList: function (callback) {
            eventsGuest.findAndCountAll({
                where: condition, limit, offset,
                attributes: ['id', 'barcode', 'phone', 'name', 'email', 'guest_max', 'guest_actual', 'invitation_status', 'invitation_send_count', 'barcode_send_count'],
                order: [['updatedAt', 'DESC']],
                include: [
                    {
                        model: eventsAppScan,
                        attributes: ['id', 'name']
                    },
                    {
                        model: events,
                        attributes: ['id', 'title'],
                        include: {
                            model: company,
                            attributes: ['id', 'title']
                        }
                    },
                    {
                        model: user,
                        attributes: ['id', 'name']
                    }
                ]
            }).then(data => {
                const response = functions.getPagingData(data, page, limit);
                callback(null, response)
            });
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

        if (results.dataGuestList.length == 0) {
            res.status(200).send({
                code: 200,
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
                guestList: results.dataGuestList,
            }
        })
        return;
    })
}