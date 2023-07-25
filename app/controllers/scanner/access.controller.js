const db = require("../../models/index.model");
const sequelize = require('sequelize');
const fs = require("fs");
var randomstring = require("randomstring");
const QRCode = require('qrcode')
const jwt = require('jsonwebtoken');
const async = require('async')

var functions = require("../../../config/function");
const { events, eventsGallery, eventsGiftBank, eventsGuest, eventsAppScan, eventsWedding, company, regRegencies, regProvincies, masterEvent, webTemplate, eventsMessage } = require("../../models/index.model");

exports.login = (req, res) => {
    let jwtSecretKey = process.env.JWT_SECRET_KEY;
    const { event_code, passcode } = req.body;

    if (!req.body.event_code && !req.body.passcode) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Please insert your event code & passcode!"
        });
    }

    eventsAppScan.findAll({
        where: { event_code: event_code, passcode: passcode }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Wrong event code/passcode!',
                data: ''
            });
            return;
        } else {
            let appUserID = data[0].id;
            let fidEvents = data[0].fid_events;
            let dataToken = {
                id: appUserID,
                event_code: event_code,
                passcode: passcode,
                fid_events: fidEvents
            }
            const token = jwt.sign(dataToken, jwtSecretKey);
            const update = {
                token: token,
                updatedAt: Date()
            }

            eventsAppScan.update(update, { where: { id: appUserID } })
                .then(data2 => {
                    eventsAppScan.findAll({
                        where: { id: appUserID },
                        attributes: ['id', 'event_code', 'phone', 'name', 'token', 'updatedAt', 'fid_events'],
                    }).then(data3 => {
                        if (data3.length == 0) {
                            res.status(200).send({
                                code: 200,
                                success: false,
                                message: 'Account not found.'
                            });
                            return;
                        }
                        res.status(200).send({
                            code: 200,
                            success: true,
                            message: 'Login Success.',
                            data: data3[0]
                        });
                    }).catch(err => {
                        res.status(400).send({
                            code: 400,
                            success: false,
                            message: err || "Error response 1."
                        })
                    })
                }).catch(err => {
                    res.status(400).send({
                        code: 400,
                        success: false,
                        message: err || "Error response 2"
                    })
                })
        }
    })
}

exports.getHomeData = (req, res) => {
    const fid_events = req.fid_events;

    async.parallel({
        dataEvent: function (callback) {
            events.findAll({
                where: { id: fid_events },
                attributes: ['id', 'title', 'description', 'banner', 'venue_name', 'event_date', 'location_address'],
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
                        model: masterEvent,
                        attributes: ['id', 'title']
                    }
                ]
            }).then(data => callback(null, data))
        },
        guestList: function (callback) {
            eventsGuest.findAll({
                where: { fid_events: fid_events, invitation_status: 'WILL ATTEND' }
            }).then(data => {
                const attending = data.length;
                callback(null, attending)
            })
        },
        guestHasCame: function (callback) {
            eventsGuest.findAll({
                where: { fid_events: fid_events, invitation_status: 'DONE' }
            }).then(data => {
                const done = data.length;
                callback(null, done)
            })
        },
    }, function (err, results) {
        if (err) {
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
            message: 'Data found',
            data: {
                dataEvent: results.dataEvent[0],
                totalGuest: results.guestList,
                guestHasCome: results.guestHasCame,
            }
        })
        return;
    })
}

exports.getGuestList = (req, res) => {
    // const appUserID = req.appUserID;
    const fid_events = req.fid_events;
    const { name, status } = req.query;
    // console.log(fid_events)

    if (name && status) {
        var condition = {
            fid_events: fid_events,
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('events_guest.name')), 'LIKE', '%' + name + '%'),
        }
    } else if (name) {
        var condition = {
            fid_events: fid_events,
            name: sequelize.where(sequelize.fn('LOWER', sequelize.col('events_guest.name')), 'LIKE', '%' + name + '%'),
        }
    } else if (status) {
        var condition = {
            fid_events: fid_events,
            invitation_status: status,
        }
    } else {
        var condition = {
            fid_events: fid_events
        }
    }

    events.findAll({
        where: { id: fid_events },
        // order: [['events_guest.name', 'ASC']],
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
            where: condition,
            order: [['name', 'ASC']],
            attributes: ['id', 'barcode', 'phone', 'email', 'name', 'guest_max', 'guest_actual', 'reason', 'invitation_status', 'scan_by'],
            include: {
                model: eventsAppScan,
                attributes: ['id', 'name']
            }
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
    }).catch(err => {
        res.status(400).send({
            code: 400,
            success: false,
            message: err || "Error response 2"
        })
    })
}

exports.scanBarcode = (req, res) => {
    const appUserID = req.appUserID;
    const fid_events = req.fid_events;
    const { barcode } = req.query;
    // console.log(barcode)

    events.findAll({
        where: { id: fid_events }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Event not found',
            })
            return;
        }

        eventsGuest.findAll({
            where: {
                barcode: barcode,
                fid_events: fid_events,
                // invitation_status: 'BARCODE SENT'
            }
        }).then(data => {
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Guest not found',
                })
                return;
            }

            eventsGuest.findAll({
                where: { barcode: barcode }
            }).then(data2 => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: 'Guest Found',
                    data: data2[0]
                })
                return;
            })
        })
    })
}

exports.updateStatus = (req, res) => {
    const appUserID = req.appUserID;
    const fid_events = req.fid_events;
    const { barcode } = req.query;
    console.log(barcode)

    events.findAll({
        where: { id: fid_events }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Event not found',
            })
            return;
        }

        eventsGuest.findAll({
            where: {
                barcode: barcode,
                fid_events: fid_events,
                // invitation_status: 'BARCODE SENT'
            }
        }).then(data => {
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: 'Guest not found',
                })
                return;
            }

            eventsGuest.update({ invitation_status: 'ATTEND', scan_by: appUserID }, {
                where: { barcode: barcode }
            }).then(data2 => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: 'Guest has come',
                })
                return;
            })
        })
    })
}