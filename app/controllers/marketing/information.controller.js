const { Sequelize, Op } = require('sequelize');
const fs = require('fs');
const sequelize = require('sequelize');
var randomstring = require("randomstring");
const async = require('async')

var functions = require("../../../config/function");
const { user, information, informationFor, promotion } = require("../../models/index.model");

exports.getMessage = (req, res) => {
    const fid_user = req.userid;

    informationFor.findAll({
        where: {
            fid_user: fid_user
        },
        attributes: ['id', 'read', 'fid_user'],
        include: {
            model: information,
            attributes: ['id', 'title', 'content', 'published', 'createdAt'],
        }
    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: data
        });
        return;
    }).catch(err => {
        // console.log(err);
        res.status(500).send({
            code: 500,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}

exports.updateRead = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.body;

    informationFor.update({ read: true },
        {
            where: { id: id, fid_user: fid_user }
        }).then(data => {
            if (data.length == 0) {
                res.status(404).send({
                    code: 404,
                    success: false,
                    message: "Datas Not Found.",
                    data: data
                });
                return;
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data Updated.",
                // data: data
            });
            return;

        }).catch(err => {
            // console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });

}

exports.getPromotionAll = (req, res) => {
    const datenow = new Date(Date.now());

    const condition = {
        start_date: { [Op.lte]: datenow },
        end_date: { [Op.gte]: datenow },
    }

    promotion.findAll({
        where: condition,
        attributes: ['id', 'image', 'title', 'description', 'code', 'discount', 'start_date', 'end_date'],
    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: data
        });
        return;
    }).catch(err => {
        // console.log(err);
        res.status(500).send({
            code: 500,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });

}