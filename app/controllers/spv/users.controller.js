const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")
var randomstring = require("randomstring");

var functions = require("../../../config/function");
const { user, userProfile, userType, masterUserStatus, events, eventsGuest, regRegencies, regProvincies, masterBank, masterOccupation, company } = require("../../models/index.model");

exports.findMyUsers = (req, res) => {
    const parent_id = req.userid;
    // console.log("User ID : " + req.userid);
    const { page, size, name } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (name) {
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'), parent_id: parent_id }
    } else {
        var condition = { parent_id: parent_id }
    }

    user.findAndCountAll({
        where: condition, limit, offset,
        order: [
            ['updatedAt', 'DESC'],
        ],
        attributes: ['id', 'email', 'name', 'photo', 'published', 'lastLogin', 'fid_user_type', 'fid_user_status', 'createdAt'],
        include: [
            {
                model: userProfile,
                attributes: ['phone_number']
            },
            {
                model: userType,
                attributes: ['type_name']
            },
            {
                model: masterUserStatus,
                attributes: ['title']
            }
        ]
    }).then(data => {
        const response = functions.getPagingData(data, page, limit);
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: response
        });
        return;
    }).catch(err => {
        res.status(500).send({
            code: 500,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
        return;
    });
}

exports.getDetail = (req, res) => {
    const parent_id = req.userid;
    const { userid } = req.query;

    async.parallel({
        dataCompany: function (callback) {
            company.findAndCountAll({ where: { fid_user: userid } })
                .then(data => callback(null, data))
        },
        dataEvents: function (callback) {
            events.findAndCountAll({ where: { fid_user: userid } })
                .then(data => callback(null, data))
        },
        dataGuest: function (callback) {
            eventsGuest.findAndCountAll({ where: { fid_user: userid } })
                .then(data => callback(null, data))
        },
        dataUser: function (callback) {
            user.findAll({
                where: { id: userid, parent_id: parent_id },
                attributes: ['username', 'email', 'name', 'photo', 'fid_user_type'],
                include: [
                    {
                        model: masterUserStatus,
                        attributes: ['id', 'title']
                    },
                    {
                        model: userProfile,
                        attributes: ['phone_number', 'gender', 'birth_place', 'birthday', 'address', 'instagram', 'hobbies'],
                        include: [
                            {
                                model: masterOccupation,
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
                    },
                ]
            }).then(data => callback(null, data))
        }
    }, function (err, results) {
        if (err == 'null') {
            res.status(400).send({
                code: 400,
                success: false,
                message: err.message,
            })
            return;
        }
        // console.log(results)

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                dashboard: {
                    total_client: results.dataCompany.count,
                    total_events: results.dataEvents.count,
                    total_guest: results.dataGuest.count,
                },
                dataUser: results.dataUser[0]
            }
        })
        return;



    })


}
