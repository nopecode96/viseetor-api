const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
var randomstring = require("randomstring");
const QRCode = require('qrcode')
const async = require('async')

var functions = require("../../../config/function");
const { events, eventsGallery, eventsGiftBank, eventsGuest, eventsTicketing, eventsWedding, company, regRegencies, regProvincies, masterEvent, webTemplate } = require("../../models/index.model");

exports.findEvents = (req, res) => {
    const today = new Date();

    const fid_user = req.userid;
    // const { page, size, title, company_name, typeid } = req.query;
    const { page, size, title, companyid, typeid } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title && companyid && typeid) {
        var condition = {
            event_date: { [sequelize.Op.gte]: today },
            fid_company: companyid,
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_type: typeid,
            fid_user: fid_user
        }
    } else if (title && companyid) {
        var condition = {
            event_date: { [sequelize.Op.gte]: today },
            fid_company: companyid,
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_user: fid_user
        }
    } else if (title) {
        var condition = {
            event_date: { [sequelize.Op.gte]: today },
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_user: fid_user
        }
    } else if (companyid) {
        var condition = {
            event_date: { [sequelize.Op.gte]: today },
            fid_company: companyid,
            fid_user: fid_user
        }
    } else if (typeid) {
        var condition = {
            event_date: { [sequelize.Op.gte]: today },
            fid_type: typeid,
            fid_user: fid_user
        }
    } else {
        var condition = {
            event_date: { [sequelize.Op.gte]: today },
            fid_user: fid_user
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
                where: { fid_company_status: 1, fid_user: fid_user },
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

exports.findEventsExpired = (req, res) => {
    const today = new Date();

    const fid_user = req.userid;
    const { page, size, title, companyid, typeid } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title && companyid && typeid) {
        var condition = {
            event_date: { [sequelize.Op.lte]: today },
            fid_company: companyid,
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_type: typeid,
            fid_user: fid_user
        }
    } else if (title && companyid) {
        var condition = {
            event_date: { [sequelize.Op.lte]: today },
            fid_company: companyid,
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_user: fid_user
        }
    } else if (title) {
        var condition = {
            event_date: { [sequelize.Op.lte]: today },
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_user: fid_user
        }
    } else if (companyid) {
        var condition = {
            event_date: { [sequelize.Op.lte]: today },
            fid_company: companyid,
            fid_user: fid_user
        }
    } else if (typeid) {
        var condition = {
            event_date: { [sequelize.Op.lte]: today },
            fid_type: typeid,
            fid_user: fid_user
        }
    } else {
        var condition = {
            event_date: { [sequelize.Op.lte]: today },
            fid_user: fid_user
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
                attributes: ['id', ['title', 'company_name'], 'fid_company_status']
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
                        attributes: ['id', ['title', 'company_name']]
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

exports.getDetail = (req, res) => {
    const fid_user = req.userid;
    const { id, typeid } = req.query;
    var condition = { id: id, fid_user: fid_user, fid_type: typeid }

    async.parallel({
        mstRegency: function (callback) {
            regRegencies.findAll({
                attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
                include: {
                    model: regProvincies,
                    attributes: [],
                }
            }).then(data => callback(null, data))
        },
        webTemplate: function (callback) {
            webTemplate.findAll({
                where: { fid_type: typeid, published: true }
            }).then(data => callback(null, data))
        },
        guestConfirmed: function (callback) {
            eventsGuest.findAll({
                where: { fid_events: id, invitation_status: 'CONFIRMED' }
            }).then(data => {
                const attending = data.length;
                callback(null, attending)
            })
        },
        eventsGuest: function (callback) {
            eventsGuest.findAll({
                where: { fid_events: id }
            }).then(data => {
                const totalGuest = data.length;
                callback(null, totalGuest)
            })
        },
        eventDetail: function (callback) {
            events.findAll({
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
                    { model: webTemplate, attributes: ['id', 'image', 'title'] },
                    { model: masterEvent, attributes: ['id', 'title'] },
                    { model: company, attributes: ['id', 'title', 'logo', 'contact_person', 'contact_phone'] },
                    { model: eventsWedding },
                    { model: eventsGiftBank, attributes: ['id', 'bank_name', 'bank_account_number', 'bank_account_name'] },
                    { model: eventsGallery },
                ]
            }).then(data => callback(null, data))
        },

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

        if (results.eventDetail.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data not found',
            })
            return;
        }

        const totalGuest = results.eventsGuest ? results.eventsGuest : 0;
        const guestConfirmed = results.guestConfirmed ? results.guestConfirmed : 0;
        const invitationLimit = results.eventDetail[0].invitation_limit ?? 0;

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dashboard: {
                    pieChartGuest: {
                        invitationLimit: invitationLimit,
                        totalGuest: totalGuest
                    },
                    pieChartGuestAttend: {
                        totalGuest: totalGuest,
                        totalConfirmed: guestConfirmed
                    }
                },
                eventDetail: results.eventDetail[0],
                mstRegency: results.mstRegency,
                webTemplate: results.webTemplate
            }
        })
        return;
    })

}

exports.updateEvent = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { title, event_date, location_address, fid_regencies, location_coordinate_latitude, location_coordinate_longitude } = req.body;

    if (!title || !event_date || !location_address || !fid_regencies || !location_coordinate_latitude || !location_coordinate_longitude) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.update({ title, event_date, location_address, fid_regencies, location_coordinate_latitude, location_coordinate_longitude }, {
        where: { id: id, fid_user: fid_user }
    }).then(data => {
        if (data[0] == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event Id not found.",
                data: data
            });
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: "Event Data Updated.",
            data: data
        });
        return;
    })

}

exports.pageCreateStep1 = (req, res) => {
    masterEvent.findAll({
        where: { published: true },
        attributes: ['id', 'title']
    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Data found.",
            data: data
        });
        return;
    }).catch(err => {
        console.log(err);
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}

exports.pageCreatesStep2 = (req, res) => {
    const fid_user = req.userid;
    const { fid_type } = req.query;

    async.parallel({
        companies: function (callback) {
            company.findAll({
                where: { fid_company_status: 1, fid_user: fid_user },
                attributes: ['id', 'title']
            })
                .then(data => callback(null, data))
        },
        webTemplate: function (callback) {
            webTemplate.findAll({
                where: { fid_type: fid_type },
                attributes: ['id', 'image', 'title']
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
                webTemplate: results.webTemplate,
                companies: results.companies,
                dataRegency: results.mstRegency,
            }
        })
        return;
        // results now equals to: { task1: 1, task2: 2 }
    });
}

exports.create = (req, res) => {
    const fid_user = req.userid;
    const { title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, fid_company, fid_regencies, published, fid_type, fid_template } = req.body;
    const invitation_limit = 0;

    if (!title || !event_date || !venue_name || !location_address || !fid_company || !fid_type || !fid_template) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    if (!req.file) {
        events.create({ title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, invitation_limit, fid_company, fid_regencies, published, fid_user, fid_type, fid_template })
            .then(data => {
                res.status(201).send({
                    code: 201,
                    success: true,
                    message: "Create data success.",
                    insertID: data.id
                });
                return;
            })
            .catch(err => {
                //   console.log(err);
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
                return;
            });

    } else {
        const banner = req.file.filename;
        events.create({ banner, title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, invitation_limit, fid_company, fid_regencies, published, fid_user, fid_type, fid_template })
            .then(data => {
                res.status(201).send({
                    code: 201,
                    success: true,
                    message: "Create data success.",
                    insertID: data.id
                });
                return;
            })
            .catch(err => {
                //   console.log(err);
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
                return;
            });
    }
}

exports.updateGiftBankStatus = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { gift_bank_status } = req.body;

    if (!id || !gift_bank_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.update({ gift_bank: gift_bank_status }, {
        where: {
            id: id,
            fid_user: fid_user
        }
    }).then(data => {
        // console.log(data);
        if (data[0] == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event ID not Found."
            });
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: "Bank Gift Status Updated.",
            // fid_events: data

        });
        return;
    })
}

exports.createBank = (req, res) => {
    const published = true;
    const { bank_name, bank_account_number, bank_account_name, fid_events } = req.body;
    if (!bank_name || !bank_account_name || !bank_account_number || !fid_events) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsGiftBank.create({ bank_name, bank_account_number, bank_account_name, published, fid_events })
        .then(data => {
            res.status(201).send({
                code: 201,
                success: true,
                message: "Create data success.",
                insertID: data.id
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
            return;
        });
}

exports.deleteBank = (req, res) => {
    const { id } = req.query;
    if (!id) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "ID Not Found."
        });
        return;
    }

    eventsGiftBank.destroy({
        where: { "id": id }
    })
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: "Data has been deleted."
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
            return;
        });
}




////EventWeddings===========
////EventWeddings===========
////EventWeddings===========
////EventWeddings===========

exports.createWeddingDetail = (req, res) => {
    const { bride_name, groom_name, bride_parent, groom_parent, bride_ig_account, groom_ig_account, quote_word, music_url, family_invite, fid_events } = req.body;
    if (!bride_name || !groom_name || !fid_events) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsWedding.create({ bride_name, groom_name, bride_parent, groom_parent, bride_ig_account, groom_ig_account, quote_word, music_url, family_invite, fid_events })
        .then(data => {
            res.status(201).send({
                code: 201,
                success: true,
                message: "Create data success.",
                insertID: data.id
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
            return;
        });
}

exports.updateWeddingDetail = (req, res) => {
    const { bride_name, groom_name, bride_parent, groom_parent, bride_ig_account, groom_ig_account, quote_word, music_url, family_invite } = req.body;
    const { id } = req.query;

    if (!bride_name || !groom_name) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsWedding.findAll({
        where: { fid_events: id }
    }).then(data => {
        if (data.length == 0) {
            eventsWedding.create({ bride_name, groom_name, bride_parent, groom_parent, bride_ig_account, groom_ig_account, quote_word, music_url, family_invite, fid_events })
                .then(data => {
                    res.status(201).send({
                        code: 201,
                        success: true,
                        message: "Create data success.",
                        insertID: data.id
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
                    return;
                });
        } else {
            eventsWedding.update({ bride_name, groom_name, bride_parent, groom_parent, bride_ig_account, groom_ig_account, quote_word, music_url, family_invite },
                { where: { fid_events: id } }
            ).then(data => {
                res.status(202).send({
                    code: 202,
                    success: true,
                    message: "Update data success.",
                    // insertID: data.id
                });
                return;
            }).catch(err => {
                console.log(err);
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
                return;
            });
        }
    })
}

exports.putBridePhoto = (req, res) => {
    const { id } = req.query;
    const bride_photo = req.file.filename;

    if (!bride_photo) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsWedding.update({ bride_photo },
        { where: { fid_events: id } }
    ).then(data => {
        res.status(201).send({
            code: 201,
            success: true,
            message: "Change photo bride has been success.",
            // insertID: data.id
        });
        return;
    }).catch(err => {
        //   console.log(err);
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
        return;
    });

}

exports.putGroomPhoto = (req, res) => {
    const { id } = req.query;
    const groom_photo = req.file.filename;

    if (!groom_photo) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsWedding.update({ groom_photo },
        { where: { fid_events: id } }
    ).then(data => {
        res.status(201).send({
            code: 201,
            success: true,
            message: "Change photo groom has been success.",
            insertID: data.id
        });
        return;
    }).catch(err => {
        //   console.log(err);
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
        return;
    });
}


////====Gallery=========
////====Gallery=========
////====Gallery=========
////====Gallery=========

exports.getGalleryList = (req, res) => {
    const { fid_events } = req.query;

    eventsGallery.findAll({
        where: { fid_events: fid_events },
        order: [['updatedAt', 'ASC']],
        attributes: ['id', 'image', 'published', 'fid_events']
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
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.uploadPhoto = (req, res) => {
    const { fid_events } = req.body;
    const images = req.files;

    if (!images) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    const datas = [];
    for (let item of images) {
        datas.push({ image: item.filename, fid_events: fid_events, published: true });
    }

    eventsGallery.bulkCreate(datas)
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: "Upload Image success."
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });

}



////====guest====
////====guest====
////====guest====
////====guest====

exports.allEventGuest = (req, res) => {
    const { page, size, name, fid_events } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (name) {
        var condition = {
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'),
            fid_events: fid_events
        }
    } else {
        var condition = {
            fid_events: fid_events
        }
    }

    async.parallel({
        dataEvents: function (callback) {
            events.findAll({
                where: { id: fid_events },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        eventLimit: function (callback) {
            events.findAll({
                where: { id: fid_events },
            }).then(data => callback(null, data))
        },
        eventsGuest: function (callback) {
            eventsGuest.findAll({
                where: { fid_events: fid_events }
            }).then(data => {
                const totalGuest = data.length;
                callback(null, totalGuest)
            })
        },
        guestConfirmed: function (callback) {
            eventsGuest.findAll({
                where: { fid_events: fid_events, invitation_status: 'CONFIRMED' }
            }).then(data => {
                const confirmed = data.length;
                callback(null, confirmed)
            })
        },
        dataGuestList: function (callback) {
            eventsGuest.findAndCountAll({
                where: condition, limit, offset,
                order: [['updatedAt', 'DESC']],
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

        const totalGuest = results.eventsGuest ? results.eventsGuest : 0;
        const totalConfirmed = results.guestConfirmed ? results.guestConfirmed : 0;
        const totalLimit = results.eventLimit[0].invitation_limit;
        // console.log(results.eventsGuest)

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dashboard: {
                    totalGuest: totalGuest,
                    totalConfirmed: totalConfirmed,
                    totalLimit: totalLimit
                },
                dataEvent: results.dataEvents[0],
                guestList: results.dataGuestList,
            }
        })
        return;

    })
}

exports.createGuest = (req, res) => {
    const fid_user = req.userid;
    const { phone, email, name, guest_max, fid_events } = req.body;
    const guest_actual = 0;
    const invitation_send_count = 0;
    const barcode_send_count = 0;
    const attend = false;
    const invitation_status = 'LISTED'

    if (!fid_events) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Event ID Not Found."
        });
        return;
    }

    events.findAll({
        where: { id: fid_events }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event ID Not Found."
            });
            return;
        }

        var invitationLimit = parseInt(data[0].invitation_limit);

        eventsGuest.findAll({
            where: { fid_events: fid_events }
        }).then(data2 => {
            var totalExistGuest = parseInt(data2.length);

            if (totalExistGuest >= invitationLimit) {
                res.status(422).send({
                    code: 422,
                    success: false,
                    message: "Your limit has full, please buy limit again."
                });
                return;
            } else {
                const barcode = randomstring.generate({
                    length: 16,
                    capitalization: 'uppercase'
                });
                if (!phone || !name || !guest_max || !fid_events || !fid_user) {
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: "Error Insert: Field."
                    });
                    return;
                }

                eventsGuest.create({ barcode, phone, email, name, invitation_status, guest_max, guest_actual, invitation_send_count, barcode_send_count, attend, fid_events, fid_user })
                    .then(data => {
                        res.status(201).send({
                            code: 201,
                            success: true,
                            message: "Create data guest success.",
                            insertID: data.id
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
                        return;
                    });
            }
        })
    })



}

exports.deleteGuest = (req, res) => {
    const { id, fid_events } = req.query;
    if (!id || !fid_events) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "ID Not Found."
        });
        return;
    }

    eventsGuest.destroy({
        where: { "id": id, fid_events: fid_events }
    })
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: "Data has been deleted."
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
            return;
        });
}

exports.updateAttendStatusGuest = (req, res) => {
    const { id, attend } = req.query;
    if (!id) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "ID Not Found."
        });
        return;
    }

    eventsGuest.update({
        attend: attend
    }, { where: { "id": id } })
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: "Data has changes."
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
            return;
        });
}

exports.updateGuestInvitationSent = (req, res) => {
    const { guest_id } = req.body;
    // console.log(guest_id);

    eventsGuest.findAll({
        where: { id: guest_id }
    })
        .then(data => {
            console.log(data[0].invitation_send_count);
            var existCount = data[0].invitation_send_count;
            var lastCount = parseInt(existCount) + parseInt(1);
            // console.log(existCount);

            eventsGuest.update({ invitation_send_count: lastCount }, { where: { id: guest_id } })
                .then(data2 => {
                    res.status(200).send({
                        code: 200,
                        success: true,
                        message: "Invitation Sent.",
                        data: data2
                    });
                })
                .catch(err => {
                    res.status(400).send({
                        code: 400,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
}

exports.updateGuestBarcodeSent = (req, res) => {
    const { guest_id } = req.body;
    // console.log(guest_id);

    eventsGuest.findAll({
        where: { id: guest_id }
    })
        .then(data => {
            // console.log(data[0].barcode_send_count);
            var existCount = data[0].barcode_send_count;
            var lastCount = parseInt(existCount) + parseInt(1);
            // console.log(existCount);

            eventsGuest.update({ barcode_send_count: lastCount }, { where: { id: guest_id } })
                .then(data2 => {
                    res.status(200).send({
                        code: 200,
                        success: true,
                        message: "Barcode Sent.",
                        data: data2
                    });
                })
                .catch(err => {
                    res.status(400).send({
                        code: 400,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
}

exports.updateStatusAttending = (req, res) => {
    const { barcode, guest_actual, attend, reason } = req.body;

    if (!barcode || !guest_actual || !attend) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Field Not Valid."
        });
        return;
    }

    eventsGuest.update({ guest_actual, attend, reason }, {
        where: { barcode: barcode }
    })
        .then(data => {
            if (data[0] == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'data not found',
                    // data: data2
                });
                return;
            }
            eventsGuest.findAll({
                where: { barcode: barcode }
            })
                .then(data2 => {
                    let stringdata = JSON.stringify(data2[0]);
                    // Converting the data into base64
                    QRCode.toDataURL(stringdata, function (err, code) {
                        if (err) return console.log("error occurred");
                        // Printing the code
                        // console.log(code)
                        // const buffer = Buffer.from(code, "base64");

                        var imageBuffer = decodeBase64Image(code);

                        fs.writeFile(process.env.MNT_PATH + 'event/qrcode/' + barcode + '.png', imageBuffer.data, function (err) {

                            if (err == 'null') {
                                console.log(err);
                                res.status(400).send({
                                    code: 400,
                                    success: false,
                                    message: err,
                                    // data: data2
                                });
                                return;
                            }
                            res.status(202).send({
                                code: 202,
                                success: true,
                                message: "Attendance Updated and File QRCode has been created.",
                                // data: data2
                            });
                            return;
                        });

                    })
                })
                .catch(err => {
                    res.status(400).send({
                        code: 400,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
        .catch(err => {
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.themesSelected = (req, res) => {
    const { id, fid_template } = req.body;

    events.update({ fid_template: fid_template }, { where: { id: id } })
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: 'Template Updated',
                data: data
            });
            return;
        })
        .catch(err => {
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}