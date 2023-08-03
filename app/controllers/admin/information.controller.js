const db = require("../../models/index.model");
const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")
var functions = require("../../../config/function");
const { promotion, user } = require("../../models/index.model");

exports.getInformation = (req, res) => {

}

exports.getPromo = (req, res) => {
    const fid_user = req.userid;
    const { page, size, title } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (title) {
        var condition = { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + title + '%') }
    } else {
        var condition = null;
    }

    promotion.findAndCountAll({
        where: condition, limit, offset,
        order: [['updatedAt', 'DESC']],
        include: {
            model: user,
            attributes: ['id', 'name']
        }
    }).then(data => {
        const response = functions.getPagingData(data, page, limit);
        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data found',
            data: response
        })
        return;
    })
}

exports.postPromo = (req, res) => {
    const fid_user = req.userid;
    const { title, description, code, discount, start_date, end_date } = req.query;
    const usage = 0;
    const published = true;


}