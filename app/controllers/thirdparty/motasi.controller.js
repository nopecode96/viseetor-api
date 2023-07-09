const db = require("../../models/index.model");
const sequelize = require('sequelize');

var functions = require("../../../config/function");
const { transaction } = require("../../models/index.model");

exports.webhook = (req, res) => {
    console.log(req.headers);
    console.log(req.body);

    res.status(200).send({
        code: 200,
        success: true,
        message: 'Thanks',
    })
    return;

}