const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');

var functions = require("../../../config/function");
const { user, userProfile, commission, commissionWithdraw } = require("../../models/index.model");

exports.getDataDashboard = (req, res) => {
    user.findAll({

        attributes: [[sequelize.fn('month', sequelize.col('createdAt')), 'data']]
    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: data
        })
        return;
    })
}