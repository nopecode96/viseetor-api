// const db = require("../models/index.model");
const QRCode = require('qrcode');
const fs = require("fs");
const { events, eventsWedding, eventsGuest, eventsGallery, regRegencies, regProvincies, company, eventsGiftBank } = require("../../models/index.model");

exports.getData = (req, res) => {
    const { id } = req.query;
    var condition = { barcode: id };
    // console.log(id);

    eventsGuest.findAll({
        where: condition,
        include: [
            {
                model: events,
                include: [
                    {
                        model: regRegencies,
                        attributes: ['name'],
                        include: {
                            model: regProvincies,
                            attributes: ['name']
                        }
                    },
                    {
                        model: eventsWedding
                    },
                    {
                        model: eventsGallery
                    },
                    {
                        model: eventsGiftBank
                    },
                    {
                        model: company,
                        attributes: ['title']
                    }
                ]
            }
        ]
    })
        .then(data => {
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Data Not Found",
                });
                return;
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data Found!",
                data: data[0]
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

exports.updateStatusAttending = (req, res) => {
    const { barcode, guest_actual, invitation_status, reason } = req.body;

    if (!barcode || !guest_actual || !invitation_status) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Field Not Valid."
        });
        return;
    }

    // console.log(barcode);
    eventsGuest.findAll({
        where: { barcode: barcode }
    })
        .then(dataGuest => {
            // console.log('disana')
            const guestMax = dataGuest[0].guest_max;
            // console.log();
            if (parseInt(guest_actual) > guestMax) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "You are over guest limit.",
                });
                return;
            } else {
                eventsGuest.update({ guest_actual, invitation_status, reason }, {
                    where: { barcode: barcode }
                })
                    .then(data => {
                        if (data[0] == 0) {
                            res.status(200).send({
                                code: 200,
                                success: false,
                                message: "error Update Data",
                                // data: data2
                            });
                            return;
                        }
                        eventsGuest.findAll({
                            where: { barcode: barcode }
                        })
                            .then(data2 => {
                                let stringdata = JSON.stringify(data2[0]);
                                QRCode.toDataURL(stringdata, function (err, code) {
                                    if (err) return console.log("error occurred");
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