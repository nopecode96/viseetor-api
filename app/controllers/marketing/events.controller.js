const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
var randomstring = require("randomstring");
const QRCode = require('qrcode')
const async = require('async')
const axios = require("axios")

var functions = require("../../../config/function");
const { events, eventsGallery, eventsGiftBank, eventsGuest, eventsAppScan, eventsWedding, company, regRegencies, regProvincies, masterEvent, webTemplate, eventsMessage } = require("../../models/index.model");

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

    if (!id || !typeid) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'Please check your Event Id & Event Type',
        })
        return;
    }

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
                where: { fid_events: id, invitation_status: 'WILL ATTEND' }
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
    const published = true;
    const gift_bank = false;
    const ticketing = false; //for fid_type = 1;
    const guest = true; //for fid_type = 1;

    const { title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, fid_company, fid_regencies, fid_type, fid_template } = req.body;
    const invitation_limit = 0;

    console.log(title, event_date, venue_name, location_address, fid_company, fid_type, fid_template)

    if (!title || !event_date || !venue_name || !location_address || !fid_company || !fid_type || !fid_template) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

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

            if (fid_type == '1') {
                eventsWedding.create({ fid_events: id })
                    .then(dat2 => {
                        masterEvent.findAll({
                            where: { id: fid_type }
                        }).then(data2 => {
                            if (data2.length == 0) {
                                res.status(200).send({
                                    code: 200,
                                    success: false,
                                    message: "Fid Type Not Found.",
                                    // insertID: data.id
                                });
                                return;
                            }

                            const sample_message = data2[0].sample_message;
                            const sample_message_barcode = data2[0].sample_message_barcode;

                            eventsMessage.create({
                                title: 'default',
                                image: 'default.jpg',
                                content: sample_message,
                                content_barcode: sample_message_barcode,
                                published: true,
                                fid_events: id
                            }).then(data2a => {
                                res.status(201).send({
                                    code: 201,
                                    success: true,
                                    message: "Create data event success.",
                                    fid_events: id
                                });
                                return;
                            });
                        })
                    })
            }

            masterEvent.findAll({
                where: { id: fid_type }
            }).then(data3 => {
                if (data3.length == 0) {
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: "Fid Type Not Found.",
                        // insertID: data.id
                    });
                    return;
                }

                const sample_message = data3[0].sample_message;
                const sample_message_barcode = data3[0].sample_message_barcode;

                eventsMessage.create({
                    title: 'default',
                    image: 'default.jpg',
                    content: sample_message,
                    content_barcode: sample_message_barcode,
                    published: true,
                    fid_events: id
                }).then(data3a => {
                    res.status(201).send({
                        code: 201,
                        success: true,
                        message: "Create data event success.",
                        fid_events: id
                    });
                    return;
                });
            })
        })
        .catch(err => {
            //   console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err
            });
            return;
        });

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

exports.uploadGallery = (req, res) => {
    const fid_user = req.userid;
    const { fid_events } = req.body;
    const images = req.files;

    // console.log(images)
    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(dataEvent => {
        if (dataEvent.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event not found."
            });
            return;
        }
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
    })
}

exports.deleteGallery = (req, res) => {
    const fid_user = req.userid;
    const { imageID, fid_events } = req.query;

    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(dataEvent => {
        if (dataEvent.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event not found."
            });
            return;
        }

        eventsGallery.destroy({
            where: { id: imageID }
        }).then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: "Photo Gallery has been deleted."
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
                attributes: ['id', 'title', 'fid_type'],
                include: [
                    {
                        model: masterEvent,
                        attributes: ['id', 'title']
                    },
                    {
                        model: eventsMessage
                    }
                ]
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
                where: { fid_events: fid_events, invitation_status: 'WILL ATTEND' }
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

        if (results.dataEvents.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data not found',
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

exports.guestDownload = (req, res) => {
    const fid_user = req.userid;

    const { fid_events } = req.query;

    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data not found',
            })
            return;
        }

        eventsGuest.findAll({
            where: { fid_events: fid_events },
            attributes: ['phone', 'email', 'name', 'guest_max', 'guest_actual', 'reason', 'invitation_status', 'scan_by']
        }).then(dataGuest => {
            if (dataGuest.length == 0) {
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
                message: 'Data found',
                data: dataGuest
            })
            return;
        })
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

    eventsGuest.findAll({
        where: { barcode: barcode }
    }).then(data => {
        console.log('process sent invitation step 1');
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
        const existInvitationStatus = data[0].invitation_status;
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
            if (data2.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Event not found',
                });
                return;
            }

            console.log('process sent invitation step 2');
            var eventMessage = data2[0].events_messages[0].content;
            const imageOri = process.env.MNT_PATH + 'event/thumbnail/' + data2[0].events_messages[0].image;
            var image = base64_encode(imageOri);
            const imageFilename = data2[0].events_messages[0].image;

            const eventCompanyName = data2[0].company.title;
            const eventCompanyContactPerson = data2[0].company.contact_person;
            const eventCompanyContactNumber = data2[0].company.contact_phone;
            const eventWedding = data2[0].events_wedding;

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
            const websiteURL = process.env.WEBSITE_WEDDING_URL + '?id=' + barcode;

            const em = eventMessage.replace('{{guestName}}', guestName);
            const em2 = em.replace('{{parentBrideName}}', bride_parent);
            const em3 = em2.replace('{{parentGroomName}}', groom_parent);
            const em4 = em3.replaceAll('{{brideName}}', bride_name);
            const em5 = em4.replaceAll('{{groomName}}', groom_name);
            const em6 = em5.replace('{{weddingDate}}', weddingDate);
            const em7 = em6.replace('{{weddingTime}}', weddingTime);
            const em8 = em7.replace('{{venueName}}', venue_name);
            const em9 = em8.replace('{{venueAddress}}', address).trim();
            const em10 = em9.replace('{{websiteURL}}', websiteURL);
            const woInfo = '\n\nJika ada pertanyaan, silahkan hubungi kami:\n' + eventCompanyContactPerson + ' ' + eventCompanyContactNumber + '\n' + eventCompanyName + '\n\n\n```Mohon reply dengan mengetik "Hi" untuk mengaktifkan Link URL/Website, lalu tutup chat ini dan buka kembali.```\n\nSender by Viseetor.com'
            const eventWAMessage = em10 + woInfo;
            console.log('process sent invitation step 3');

            var data = JSON.stringify({
                "api_key": process.env.WAPI_API,
                "device_key": process.env.WAPI_DEVICE,
                "destination": phone,
                "image": image,
                "filename": imageFilename,
                "caption": eventWAMessage
            });

            var config = {
                method: 'post',
                url: process.env.WAPI_URL + 'send-image',
                headers: { 'Content-Type': 'application/json' },
                data: data
            };
            axios(config).then(function (response) {
                console.log('process sent invitation step 4');
                console.log(response.data);
                if (response.data.status !== "ok") {
                    res.status(200).send({
                        code: 1005,
                        success: false,
                        message: response.data.message
                    });
                    return;
                }

                const updateCount = parseFloat(existInvitationSentCount) + parseFloat('1');
                const status = (existInvitationStatus == 'LISTED') ? 'INVITED' : existInvitationStatus;
                eventsGuest.update({
                    invitation_status: status, invitation_send_count: updateCount
                }, {
                    where: { barcode: barcode }
                }).then(datafinal => {
                    console.log('process sent invitation success');
                    res.status(200).send({
                        code: 200,
                        success: true,
                        message: 'Invitation has sent.',
                        wapi_response: response.data
                    });
                    return;
                })

            }).catch(function (error) {
                console.log(error);
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: error,
                });
                return;
            });
        })
    })
}

exports.getBulkForInvitationSent = (req, res) => {
    const fid_user = req.userid;
    const { eventID, status } = req.query;
    const invitation_status = (status == 1) ? 'LISTED' : 'WILL ATTEND';
    if (!eventID) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field (eventID)"
        });
        return;
    }

    eventsGuest.findAll({
        where: {
            fid_events: eventID, invitation_status: invitation_status, fid_user: fid_user
        },
        attributes: ['barcode', 'phone']
    }).then(eventGuest => {
        if (eventGuest.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Guest not found."
            });
            return;
        }
        res.status(200).send({
            code: 200,
            success: true,
            message: "Guest found.",
            data: eventGuest
        });
        return;
    });
}

exports.guestBarcodeSent = (req, res) => {
    const { barcode } = req.query;

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
        const existBarcodeSentCount = data[0].barcode_send_count;

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
            var eventMessage = data2[0].events_messages[0].content_barcode;
            // const image = process.env.CDN_URL + 'event/qrcode/' + barcode + '.png';
            const imageOri = process.env.MNT_PATH + 'event/qrcode/' + barcode + '.png';
            console.log(imageOri);
            fs.access(imageOri, fs.F_OK, (err) => {
                if (err) {
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: 'Barcode not found, please confirmation before send barcode.',
                    });
                    return;
                }

                var image = base64_encode(imageOri);
                // console.log(image);
                const imageFilename = barcode + '.png';

                const eventCompanyName = data2[0].company.title;
                const eventCompanyContactPerson = data2[0].company.contact_person;
                const eventCompanyContactNumber = data2[0].company.contact_phone;
                const eventWedding = data2[0].events_wedding;

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

                const em = eventMessage.replace('{{guestName}}', guestName);
                const em1 = em.replaceAll('{{brideName}}', bride_name);
                const em2 = em1.replaceAll('{{groomName}}', groom_name);
                const em3 = em2.replace('{{weddingDate}}', weddingDate);
                const em4 = em3.replace('{{weddingTime}}', weddingTime);
                const em5 = em4.replace('{{venueName}}', venue_name);
                const em6 = em5.replace('{{venueAddress}}', address).trim();
                const woInfo = '\n\nJika ada pertanyaan, silahkan hubungi kami:\n' + eventCompanyContactPerson + ' ' + eventCompanyContactNumber + '\n' + eventCompanyName + '\n\nSender by Viseetor.com';
                const eventWAMessage = em6 + woInfo;

                // var data = JSON.stringify({
                //     "api_key": process.env.WATZAP_KEY,
                //     "number_key": process.env.WATZAP_NUMBER_KEY,
                //     "phone_no": phone,
                //     "url": image,
                //     "message": eventWAMessage,
                //     "separate_caption": 0 //(0 for No, 1 for Yes)
                // });

                // Body for WAPI
                var data = JSON.stringify({
                    "api_key": process.env.WAPI_API,
                    "device_key": process.env.WAPI_DEVICE,
                    "destination": phone,
                    "image": image,
                    "filename": imageFilename,
                    "caption": eventWAMessage
                });

                var config = {
                    method: 'post',
                    url: process.env.WAPI_URL + 'send-image',
                    headers: { 'Content-Type': 'application/json' },
                    data: data
                };
                axios(config).then(function (response) {
                    console.log(JSON.stringify(response.data));
                    if (response.data.status !== "ok") {
                        res.status(200).send({
                            code: 1005,
                            success: false,
                            message: response.data.message

                        });
                        return;
                    }

                    const updateCount = parseFloat(existBarcodeSentCount) + parseFloat('1');
                    eventsGuest.update({
                        invitation_status: 'BARCODE SENT', barcode_send_count: updateCount
                    }, {
                        where: { barcode: barcode }
                    }).then(datafinal => {
                        res.status(200).send({
                            code: 200,
                            success: true,
                            message: 'Barcode Invitation has sent.',
                            wapi_response: response.data
                        });
                        return;
                    })

                }).catch(function (error) {
                    console.log(error);
                    res.status(200).send({
                        code: 200,
                        success: false,
                        message: error,
                    });
                    return;
                });
            })
        });
    });
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

    eventsGuest.findAll({
        where: { barcode: barcode }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Guest not found."
            });
            return;
        }

        const guestMax = data[0].guest_max;

        if (parseFloat(guest_actual) > parseFloat(guestMax)) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Guest actual over limit."
            });
            return;
        }

        const invitation_status = (attend == 'true') ? 'WILL ATTEND' : 'NOT ATTEND';

        eventsGuest.update({ guest_actual, invitation_status, reason }, {
            where: { barcode: barcode }
        }).then(data => {
            if (data[0] == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Guest not found.',
                });
                return;
            }

            eventsGuest.findAll({
                where: { barcode: barcode }
            }).then(data2 => {
                let stringdata = JSON.stringify(data2[0]);
                QRCode.toDataURL(stringdata, function (err, code) {
                    if (err) return console.log("error occurred");
                    if (err) {
                        res.status(200).send({
                            code: 200,
                            success: false,
                            message: err,
                        });
                        return;
                    }

                    var imageBuffer = decodeBase64Image(code);
                    fs.writeFile(process.env.MNT_PATH + 'event/qrcode/' + barcode + '.png', imageBuffer.data, function (err) {
                        if (err == 'null') {
                            console.log(err);
                            res.status(400).send({
                                code: 400,
                                success: false,
                                message: err,
                            });
                            return;
                        }
                        res.status(202).send({
                            code: 202,
                            success: true,
                            message: "Attendance Updated and File QRCode has been created.",
                        });
                        return;
                    });
                })
            }).catch(err => {
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
            });
        }).catch(err => {
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
    })
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
        }).catch(err => {
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

exports.updateMessageTemplate = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { content, content_barcode } = req.body;

    if (!content || !content_barcode) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }
    // console.log(req.params)

    eventsMessage.findAll({
        where: { id: id },
        include: {
            model: events,
            where: { fid_user: fid_user }
        }
    }).then(datax => {
        if (datax.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Data not found or not you dont have authorize for this content."
            });
            return;

        }

        if (!req.file) {
            eventsMessage.update({ content, content_barcode }, {
                where: { id: id }
            }).then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Data has been save."
                });
                return;
            });
        } else {
            const image = req.file.filename;

            eventsMessage.update({ image, content, content_barcode }, {
                where: { id: id }
            }).then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Data has been save."
                });
                return;
            });
        }
    }).catch(err => {
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}

///Scanner===========
///Scanner===========
///Scanner===========

exports.listScannerAccess = (req, res) => {
    const fid_user = req.userid;
    const { fid_events } = req.query;

    async.parallel({
        dataEvent: function (callback) {
            events.findAll({
                where: { id: fid_events, fid_user: fid_user },
                attributes: ['id', 'title', 'event_date', 'invitation_limit', 'fid_type'],
                include: {
                    model: masterEvent,
                    attributes: ['id', 'title']
                }
            }).then(data => callback(null, data))
        },
        dataAppScan: function (callback) {
            eventsAppScan.findAll({
                where: { fid_events: fid_events },
                order: [['updatedAt', 'ASC']],
                attributes: ['id', 'event_code', 'passcode', 'phone', 'name']
            }).then(data => callback(null, data))
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

        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: {
                dataEvent: results.dataEvent[0],
                dataAppScan: results.dataAppScan
            }
        });
        return;
    });
}

exports.postScannerAccess = (req, res) => {
    const fid_user = req.userid;
    const { name, phone, passcode, fid_events } = req.body;
    const published = true;

    if (!name || !phone || !passcode || !fid_events) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    const event_code = randomstring.generate({
        length: 6,
        charset: 'alphabetic',
        capitalization: 'uppercase'
    });

    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event Not Found."
            });
            return;
        }
        eventsAppScan.create({ event_code, passcode, phone, name, published, fid_events })
            .then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Event Scanner Access has been created."
                });
            }).catch(err => {
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
            });
    })
}

exports.deleteScannerAccess = (req, res) => {
    const fid_user = req.userid;
    const { appscanID, fid_events } = req.query;
    // const published = true;

    if (!appscanID || !fid_events) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Event Not Found."
            });
            return;
        }
        eventsAppScan.destroy({
            where: { id: appscanID }
        })
            .then(data => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Event Scanner Access has been deleted."
                });
            }).catch(err => {
                res.status(400).send({
                    code: 400,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
            });
    })
}

exports.appScanGuestList = (req, res) => {
    const fid_user = req.userid;
    const { fid_events } = req.query;

    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data not found',
            })
            return;
        }

        eventsGuest.findAll({
            where: { fid_events: fid_events },
            attributes: ['phone', 'email', 'name', 'guest_max', 'guest_actual', 'reason', 'invitation_status', 'scan_by']
        }).then(dataGuest => {
            if (dataGuest.length == 0) {
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
                message: 'Data found',
                data: dataGuest
            })
            return;
        })
    })
}

exports.sendApkToUser = (req, res) => {
    const fid_user = req.userid;
    const { appscanID, fid_events } = req.query;

    events.findAll({
        where: { id: fid_events, fid_user: fid_user }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data not found',
            })
            return;
        }

        eventsAppScan.findAll({
            where: { fid_events: fid_events, id: appscanID },
        }).then(dataUser => {
            if (dataUser.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'User not found',
                })
                return;
            }

            const eventName = data[0].title;

            const name = dataUser[0].name;
            const phone = dataUser[0].phone;
            const eventCode = dataUser[0].event_code;
            const passcode = dataUser[0].passcode;
            const message1 = 'Hallo ' + name + ',\n\nNomor kamu didaftarkan sebagai petugas penerima tamu pada acara ' + eventName + '.\n\n';
            const message2 = 'Anda dapat mengunduh aplikasi Viseetor Scanner QRCode pada link berikut:\n';
            const message3 = process.env.CDN_URL + 'viseetor.apk\n\n';
            const message4 = 'Gunakan kode dibawah untuk login pada aplikasi\n\n';
            const message5 = 'Code Event : ' + eventCode;
            const message6 = 'Code Event : ' + passcode;
            const msg = message1 + message2 + message3 + message4 + message5 + message6;
            functions.notificationWhatsApp(phone, msg, next);

            res.status(200).send({
                code: 200,
                success: true,
                message: 'Application Access has sent.',
                // data: dataUser
            })
            return;
        })
    })
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

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap).toString('base64');
}