const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
var randomstring = require("randomstring");
const QRCode = require('qrcode')
const async = require('async')

var functions = require("../../../config/function");
const { events, eventsGallery, eventsGiftBank, eventsGuest, eventsTicketing, eventsWedding, company, regRegencies, regProvincies, masterEvent, webTemplate } = require("../../models/index.model");

exports.findEvents = (req, res) => {
    const fid_user = req.userid;
    const { page, size, title, company_name, typeid } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title && company_name && typeid) {
        var condition = {
            company_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + company_name + '%'),
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_type: typeid,
            fid_user: fid_user
        }
    } else if (title && company_name) {
        var condition = {
            company_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + company_name + '%'),
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_user: fid_user
        }
    } else if (title) {
        var condition = {
            title: sequelize.where(sequelize.fn('LOWER', sequelize.col('events.title')), 'LIKE', '%' + title + '%'),
            fid_user: fid_user
        }
    } else if (company_name) {
        var condition = {
            company_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + company_name + '%'),
            fid_user: fid_user
        }
    } else if (typeid) {
        var condition = {
            fid_type: typeid,
            fid_user: fid_user
        }
    } else {
        var condition = {
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
            data: results
            // data: {
            //     // data_mst_industry: results.dataMstIndustry,
            //     datas: results,
            // }
        })
        return;
    })
}

exports.create = (req, res) => {
    const { title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, fid_company, fid_regencies, published, fid_user, fid_type } = req.body;
    const invitation_limit = 0;
    const fid_template = 1;

    if (!title || !event_date || !venue_name || !location_address || !fid_company || !fid_user || !fid_type) {
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
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Create data success.",
                    insertID: data.id
                });
                return;
            })
            .catch(err => {
                //   console.log(err);
                res.status(500).send({
                    code: 500,
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
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Create data success.",
                    insertID: data.id
                });
                return;
            })
            .catch(err => {
                //   console.log(err);
                res.status(500).send({
                    code: 500,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
                return;
            });
    }
}

exports.getDetail = (req, res) => {
    const fid_user = req.fid_user;
    const { id, typeid } = req.query;
    var condition = { id: id, fid_user: fid_user, }
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
            { model: masterEvent, attributes: ['id', 'title'] },
            { model: company, attributes: ['id', 'title', 'logo', 'contact_person', 'contact_phone'] },
            { model: eventsGiftBank, attributes: ['id', 'bank_name', 'bank_account_number', 'bank_account_name'] },
            { model: eventsWedding },
        ]
    })
        .then(data => {
            // console.log(data.length);

            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Datas Not Found.'
                });
                return;
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: 'Datas Found.',
                data: data[0]
            });
            return;

        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message: err.message || "Some error occurred while retrieving data."
            });
        });

}


//======================
//======================
//======================
//======================
//======================

exports.dashboardEvent = (req, res) => {
    const { fid_events } = req.query;


    events.findAll({
        where: { id: fid_events },
        attributes: ['id', 'invitation_limit']
    })
        .then(data => {
            const invitationLimit = data[0].invitation_limit;
            eventsGuest.findAll({
                where: { fid_events: fid_events },
            })
                .then(data2 => {
                    // console.log(data2.length);
                    const totalGuest = data2.length;
                    const limit = invitationLimit;

                    eventsGuest.findAll({
                        where: { fid_events: fid_events, attend: true }
                    })
                        .then(data3 => {
                            // console.log(data3);
                            res.status(200).send({
                                code: 200,
                                success: true,
                                message: "Datas Found.",
                                data: {
                                    limit: limit,
                                    total_guest: totalGuest,
                                    attending: data3.length
                                }
                            });
                        })
                        .catch(err => {
                            res.status(500).send({
                                code: 500,
                                success: false,
                                message:
                                    err.message || "Some error occurred while retrieving data."
                            });
                        });


                })
                .catch(err => {
                    res.status(500).send({
                        code: 500,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.allEvent = (req, res) => {
    const { company_name, user_id } = req.query;

    if (company_name) {
        var condition = {
            company_name: sequelize.where(sequelize.fn('LOWER', sequelize.col('company.title')), 'LIKE', '%' + company_name + '%'),
            fid_user: user_id
        }
    } else {
        var condition = {
            fid_user: user_id
        }
    }

    events.findAll({
        where: condition,
        order: [['event_date', 'ASC']],
        include: [
            { model: company, attributes: ['id', ['title', 'company_name']] },
            { model: masterEvent, attributes: ['id', 'title'] },
        ]
    })
        .then(data => {
            // console.log(data);
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}



exports.createOneWithImage = (req, res) => {
    const { title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, fid_company, fid_regencies, published, fid_user, fid_type } = req.body;
    const invitation_limit = 0;
    const fid_template = 1;
    const banner = req.file.filename;

    console.log(fid_regencies);

    if (!title || !event_date || !venue_name || !location_address || !fid_company || !fid_user || !fid_type) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.create({ banner, title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, invitation_limit, fid_company, fid_regencies, published, fid_user, fid_type, fid_template })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });

}

exports.createOneNoImage = (req, res) => {
    const { title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, fid_company, fid_regencies, published, fid_user, fid_type } = req.body;
    const invitation_limit = 0;
    const fid_template = 1;

    if (!title || !description || !event_date || !venue_name || !location_address || !ticketing || !gift_bank || !guest || !fid_company || !fid_user || !fid_type) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.create({ title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, invitation_limit, fid_company, fid_regencies, published, fid_user, fid_type, fid_template })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });
}

exports.updateOneNoImage = (req, res) => {
    const { title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, fid_regencies } = req.body;
    const { id } = req.query;

    if (!title || !description || !event_date || !venue_name || !location_address) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    events.update({ title, description, event_date, event_video_url, venue_name, location_address, location_coordinate_latitude, location_coordinate_longitude, ticketing, gift_bank, guest, fid_regencies },
        { where: { id: id } })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Updated data success.",
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });
}

exports.updateOneWithImage = (req, res) => {
    const { id } = req.body;
    const banner = req.file.filename;

    if (!id) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Id not found."
        });
        return;
    }

    events.update({ banner },
        { where: { id: id } })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Updated data success.",
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });
}

///============Master

exports.findAllRegional = (req, res) => {
    const { searchValue } = req.query;
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
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.findAllCompany = (req, res) => {
    const { searchValue, fid_user } = req.query;
    var condition = {
        searchValue: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + searchValue + '%'),
        fid_user: fid_user
    }

    company.findAll(
        {
            where: condition,
            attributes: [['id', 'value'], ['title', 'text']],
        },

    )
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.findAllEventType = (req, res) => {
    masterEvent.findAll({ where: { published: true } })
        .then(data => {
            // console.log(data.length);
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Datas Not Found."
                });
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data
            });
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}


exports.createOneBank = (req, res) => {
    const { bank_name, bank_account_number, bank_account_name, published, fid_events } = req.body;
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
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
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
            return;
        });
}

exports.deleteOneBank = (req, res) => {
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
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data has been deleted."
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
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
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

    eventsWedding.update({ bride_name, groom_name, bride_parent, groom_parent, bride_ig_account, groom_ig_account, quote_word, music_url, family_invite },
        { where: { id: id } }
    )
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Update data success.",
                // insertID: data.id
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
            return;
        });
}

exports.putBridePhoto = (req, res) => {
    const { id } = req.body;
    const bride_photo = req.file.filename;

    console.log(id);
    console.log(bride_photo);

    if (!bride_photo) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsWedding.update({ bride_photo },
        { where: { id: id } }
    )
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });

}

exports.putGroomPhoto = (req, res) => {
    const { id } = req.body;
    const groom_photo = req.file.filename;

    console.log(id);
    console.log(groom_photo);

    if (!groom_photo) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    eventsWedding.update({ groom_photo },
        { where: { id: id } }
    )
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
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
            res.status(500).send({
                code: 500,
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
            res.status(200).send({
                code: 200,
                success: true,
                message: "Upload Image success."
            });
            return;
        })
        .catch(err => {
            //   console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });

}

exports.deletePhoto = (req, res) => {
    const { id, filename } = req.query;

}


////====guest====
////====guest====
////====guest====
////====guest====

exports.createOneGuest = (req, res) => {
    const { phone, email, name, guest_max, fid_events, fid_user } = req.body;
    const guest_actual = 0;
    const invitation_send_count = 0;
    const barcode_send_count = 0;
    const attend = false;

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

    eventsGuest.create({ barcode, phone, email, name, guest_max, guest_actual, invitation_send_count, barcode_send_count, attend, fid_events, fid_user })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
                insertID: data.id
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
            return;
        });
}

exports.deleteOneGuest = (req, res) => {
    const { id } = req.query;
    if (!id) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "ID Not Found."
        });
        return;
    }

    eventsGuest.destroy({
        where: { "id": id }
    })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data has been deleted."
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
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data has changes."
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
            return;
        });
}

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

    eventsGuest.findAndCountAll({
        where: condition, limit, offset,
        order: [['updatedAt', 'DESC']],
        // include: {model: events, attributes: ['invitation_limit']}


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
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
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
                    res.status(500).send({
                        code: 500,
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
                    res.status(500).send({
                        code: 500,
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
                                res.status(200).send({
                                    code: 200,
                                    success: false,
                                    message: err,
                                    // data: data2
                                });
                                return;
                            }
                            res.status(200).send({
                                code: 200,
                                success: true,
                                message: "Attendance Updated and File QRCode has been created.",
                                // data: data2
                            });
                            return;
                        });

                    })
                })
                .catch(err => {
                    res.status(500).send({
                        code: 500,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.themes = (req, res) => {
    webTemplate.findAll({
        where: { published: true }
    })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: 'Data Found',
                data: data
            });
            return;
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
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
            res.status(200).send({
                code: 200,
                success: true,
                message: 'Template Updated',
                data: data
            });
            return;
        })
        .catch(err => {
            res.status(500).send({
                code: 500,
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