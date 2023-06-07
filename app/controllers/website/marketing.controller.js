// const db = require("../models/index.model");
const fs = require("fs");
const { events, eventsWedding, eventsGuest, eventsGallery, regRegencies, regProvincies, company, eventsGiftBank, masterPrice, user, userProfile } = require("../../models/index.model");


exports.getDataWeddingWeb = (req, res) => {
    const { ref } = req.query;
    if (!ref) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Field Not Valid."
        });
    }

    masterPrice.findAll({ where: { published: true } })
        .then(data => {
            user.findAll({
                where: { username: ref, published: true },
                attributes: ['id', 'name', 'username', 'photo', 'email'],
                include: {
                    model: userProfile
                }
            })
                .then(data2 => {
                    res.status(200).send({
                        code: 200,
                        success: true,
                        message: "Data found.",
                        dataPricing: data,
                        dataUser: data2[0]
                    });

                })
        })
}