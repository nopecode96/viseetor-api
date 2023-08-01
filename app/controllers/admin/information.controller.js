const db = require("../../models/index.model");
const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")

const { promotion, users } = require("../../models/index.model");

exports.getInformation = (req, res) => {

}

exports.getPrommo = (req, res) => {
    const fid_user = req.userid;
    const { page, size } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    promotion.findAll({
        where: limit, offset,
        order: [['updatedAt', 'DESC']],
        include: {
            model: users,
            attributes: ['id', 'name']
        }
    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data found',
            data: data
        })
        return;
    })
}