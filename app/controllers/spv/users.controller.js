const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")
var randomstring = require("randomstring");

var functions = require("../../../config/function");
const { user, userProfile, userType, masterUserStatus, regRegencies, regProvincies, masterBank, masterOccupation } = require("../../models/index.model");

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
    }).catch(err => {
        res.status(500).send({
            code: 500,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}
