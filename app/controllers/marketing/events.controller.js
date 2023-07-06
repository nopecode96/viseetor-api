const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
var randomstring = require("randomstring");
const QRCode = require('qrcode')
const async = require('async')
const axios = require("axios")

var functions = require("../../../config/function");
const { events, eventsGallery, eventsGiftBank, eventsGuest, eventsTicketing, eventsWedding, company, regRegencies, regProvincies, masterEvent, webTemplate, eventsMessage } = require("../../models/index.model");

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
                where: { fid_type: typeid, published: true },
                order: [['id', 'ASC']]
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
    const { title, description, venue_name, event_video_url, event_date, location_address, fid_regencies, location_coordinate_latitude, location_coordinate_longitude } = req.body;

    // console.log(req.body);
    if (!title || !description || !venue_name || !event_video_url || !event_date || !location_address || !fid_regencies || !location_coordinate_latitude || !location_coordinate_longitude) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.update({ title, description, venue_name, event_video_url, event_date, location_address, fid_regencies, location_coordinate_latitude, location_coordinate_longitude }, {
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

exports.putBanner = (req, res) => {
    const { id } = req.query;
    const banner = req.file.filename;

    if (!banner) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.update({ banner },
        { where: { id: id } }
    ).then(data => {
        res.status(201).send({
            code: 201,
            success: true,
            message: "Change Banner has been success.",
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


exports.pageCreate = (req, res) => {
    const fid_user = req.userid;

    async.parallel({
        masterEvent: function (callback) {
            masterEvent.findAll({
                where: { published: true },
                attributes: ['id', 'title']
            }).then(data => callback(null, data))
        },
        company: function (callback) {
            company.findAll({
                where: { fid_company_status: 1, fid_user: fid_user },
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
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        }
        res.status(200).send({
            code: 200,
            success: true,
            message: "Data found.",
            data: results
        });
        return;

    })
}

exports.getWebTemplate = (req, res) => {
    const { fid_type } = req.query;

    webTemplate.findAll({
        where: { fid_type: fid_type }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Data not found.",
                // data: results
            });
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: "Data found.",
            data: data
        });
        return;
    })
}

exports.create = (req, res) => {
    const fid_user = req.userid;
    //publish
    //banner
    //bank
    //tiketing
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
                if (!data) {
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: "Create error.",
                        // insertID: data.id
                    });
                    return;
                }

                const id = data.id;

                eventsMessage.create({
                    title: 'default',
                    image: 'default.jpg',
                    content: '',
                    fid_events: id
                }).then(data => {
                    res.status(201).send({
                        code: 201,
                        success: true,
                        message: "Create data success.",
                        insertID: data.id
                    });
                    return;
                });
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
                if (fid_type == '1') {
                    events
                }
                res.status(201).send({
                    code: 201,
                    success: true,
                    message: "Create data success.",
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
}

exports.updateGiftBankStatus = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { gift_bank_status } = req.body;

    console.log(id);
    console.log(gift_bank_status);

    if (!id) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Event ID not found."
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

exports.uploadGallery = (req, res) => {
    const { fid_events } = req.body;
    const images = req.files;

    // console.log(images)

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
    // console.log(datas)

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
                attributes: ['id', 'title'],
                include: {
                    model: eventsMessage
                }
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
                res.status(200).send({
                    code: 200,
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

exports.guestInvitationSent = async (req, res) => {
    const { barcode } = req.query;
    const url = process.env.API_URL;

    eventsGuest.findAll({
        where: { barcode: barcode }
    }).then(data => {
        if (data.length == 0) {
            res.status(202).send({
                code: 202,
                success: false,
                message: "Guest not found."
            });
            return;
        }

        const fid_events = data[0].fid_events;
        const phone = data[0].phone;
        const guestName = data[0].name;
        const existInvitationSentCount = data[0].invitation_send_count;

        events.findAll({
            where: { id: fid_events },
            include: [
                {
                    model: regRegencies,
                    include: {
                        model: regProvincies
                    }
                },
                { model: company },
                { model: eventsWedding },
                { model: eventsMessage }
            ]
        }).then(data2 => {
            var eventMessage = data2[0].events_messages[0].content;
            const eventBanner = process.env.CDN_URL + 'event/thumbnail/' + data2[0].events_messages[0].image;

            const eventType = data2[0].fid_type;
            const eventTitle = data2[0].title;
            const eventCompanyName = data2[0].company.title;
            const eventCompanyContactPerson = data2[0].company.contact_person;
            const eventCompanyContactNumber = data2[0].company.contact_phone;
            const eventWedding = data2[0].events_wedding;
            // const eventBanner = 'http://cdn.viseetor.id/static/event/thumb/1683002731811.jpg';

            const d = new Date(data2[0].event_date);

            const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const optionsTime = { timeZoneName: "short", hour: "2-digit", minute: "2-digit" };
            const weddingDate = d.toLocaleDateString("id", optionsDate);
            const weddingTime = d.toLocaleTimeString("id", optionsTime).replace('.', ':');

            const venue_name = data2[0].venue_name;
            const location_address = data2[0].location_address;
            const city = data2[0].reg_regencie.name;
            const province = data2[0].reg_regencie.reg_province.name;
            const address = location_address + ', ' + city + ' - ' + province;
            const bride_name = eventWedding.bride_name;
            const groom_name = eventWedding.groom_name;
            const bride_parent = eventWedding.bride_parent;
            const groom_parent = eventWedding.groom_parent;

            const em = eventMessage.replace('{{guestName}}', guestName);
            const em2 = em.replace('{{parentBrideName}}', bride_parent);
            const em3 = em2.replace('{{parentGroomName}}', groom_parent);
            const em4 = em3.replaceAll('{{brideName}}', bride_name);
            const em5 = em4.replaceAll('{{groomName}}', groom_name);
            const em6 = em5.replace('{{weddingDate}}', weddingDate);
            const em7 = em6.replace('{{weddingTime}}', weddingTime);
            const em8 = em7.replace('{{venueName}}', venue_name);
            const em9 = em8.replace('{{venueAddress}}', address).trim();
            const woInfo = '\n\nJika ada pertanyaan, silahkan hubungi kami:\n' + eventCompanyContactPerson + ' ' + eventCompanyContactNumber + '\n' + eventCompanyName + '\n\n\nMohon reply dengan *hallo* untuk mengaktifkan Link URL atau tutup chat ini dan buka kembali.'
            const eventWAMessage = em9 + woInfo;

            var data = JSON.stringify({
                "api_key": process.env.WATZAP_KEY,
                "number_key": process.env.WATZAP_NUMBER_KEY,
                "phone_no": phone,
                "url": eventBanner,
                "message": eventWAMessage,
                "separate_caption": 0 //(0 for No, 1 for Yes)
            });

            var config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: process.env.WATZAP_URL + 'send_image_url',
                headers: { 'Content-Type': 'application/json' },
                data: data
            };
            axios(config)
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                    if (response.data.message == 'Successfully') {
                        const updateCount = parseFloat(existInvitationSentCount) + parseFloat('1');
                        eventsGuest.update({
                            invitation_status: 'INVITED', invitation_send_count: updateCount
                        }, {
                            where: { barcode: barcode }
                        })

                    }
                }).catch(function (error) {
                    console.log(error);
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: error,
                        // baner: eventBanner,
                        // data: data2[0]
                    });
                    return;
                });






        })
    })


    // const body = querystring.stringify({
    //     "api_key": "DGHMEESZFIUBWYOW",
    //     "number_key": "4dkL1S8l4c1RaDH8",
    //     "phone_no": "+628176789682",
    //     "url": "http://cdn.viseetor.id/static/company/1678155669291.png",
    //     "message": "hello",
    //     "separate_caption": "0"
    // });

    // await axios.post(url, body, options).then(
    //     async (response) => {

    //     }
    // )




    // eventsGuest.findAll({
    //     where: { id: guest_id }
    // })
    //     .then(data => {
    //         console.log(data[0].invitation_send_count);
    //         var existCount = data[0].invitation_send_count;
    //         var lastCount = parseInt(existCount) + parseInt(1);
    //         // console.log(existCount);

    //         eventsGuest.update({ invitation_send_count: lastCount }, { where: { id: guest_id } })
    //             .then(data2 => {
    //                 res.status(200).send({
    //                     code: 200,
    //                     success: true,
    //                     message: "Invitation Sent.",
    //                     data: data2
    //                 });
    //             })
    //             .catch(err => {
    //                 res.status(400).send({
    //                     code: 400,
    //                     success: false,
    //                     message:
    //                         err.message || "Some error occurred while retrieving data."
    //                 });
    //             });
    //     })
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

///theme
///theme
///theme

exports.themesSelected = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { fid_template } = req.body;

    events.update({ fid_template: fid_template }, { where: { id: id, fid_user: fid_user } })
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: 'Template Updated',
                // data: data
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

///message
///message
///message

exports.themesSelected = (req, res) => {

}



///function===========
///function===========
///function===========

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