const db = require("../../models/index.model");
const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")
var functions = require("../../../config/function");
const { promotion, user, socmed } = require("../../models/index.model");

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

exports.getPromoDetail = (req, res) => {
    const fid_user = req.userid;
    const { promoID } = req.query;

    if (promoID.length == 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'Promoo ID not found'
        })
        return;
    }

    promotion.findAll({
        where: { id: promoID }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Data not found."
            });
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: "Data Found.",
            data: data[0]
        });
        return;
    })
}

exports.postPromo = (req, res) => {
    const fid_user = req.userid;
    const { title, description, code, discount, start_date, end_date } = req.body;
    const usage = 0;
    const published = true;

    if (!req.file) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Please insert Image."
        });
        return;
    }

    if (!title || !description || !code || !discount || !start_date || !end_date) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field.",
            field: {
                'title': title,
                'description': description,
                'code': code,
                'discount': discount,
                'start_date': start_date,
                'end_date': end_date
            }
        });
        return;
    }

    const image = req.file.filename;
    promotion.create({ image, title, description, code, discount, start_date, end_date, usage, published, fid_user })
        .then(data => {
            res.status(201).send({
                code: 201,
                success: true,
                message: "Create data success.",
            });
            return;
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });
}

exports.updatePromoPublished = (req, res) => {
    const fid_user = req.userid;
    const { promoID, published } = req.query;

    if (promoID.length == 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'Promoo ID not found'
        })
        return;
    }

    promotion.update(
        { published, fid_user },
        { where: { id: promoID } }
    ).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Data Publish Status Updated."
        });
        return;
    })
}

exports.promoUpdate = (req, res) => {
    const fid_user = req.userid;
    const { promoID } = req.query;
    const { title, description, code, discount, start_date, end_date } = req.body;

    if (promoID.length == 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'Promo ID not found'
        })
        return;
    }

    if (req.file) {
        const image = req.file.filename;
        promotion.update(
            { image, title, description, code, discount, start_date, end_date, fid_user },
            { where: { id: promoID } }
        ).then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data Updated."
            });
            return;
        })
    } else {
        promotion.update(
            { title, description, code, discount, start_date, end_date, fid_user },
            { where: { id: promoID } }
        ).then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data Updated."
            });
            return;
        })
    }

}

/////================Socmed Material==============/////////
/////================Socmed Material==============/////////
/////================Socmed Material==============/////////

exports.getSocmedMaterial = (req, res) => {
    const fid_user = req.userid;
    const { page, size, title } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);
    var condition = null;
    console.log('disini')

    socmed.findAndCountAll({
        where: condition, limit, offset,
        // order: [['updatedAt', 'DESC']],
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

exports.getSocmedDetail = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;

    if (id.length == 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'Promoo ID not found'
        })
        return;
    }

    socmed.findAll({
        where: { id: id }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Data not found."
            });
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: "Data Found.",
            data: data[0]
        });
        return;
    })
}

exports.postSocmed = (req, res) => {
    const fid_user = req.userid;
    const { title, description } = req.body;
    // const usage = 0;
    const published = true;

    if (!req.file) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Please insert Image."
        });
        return;
    }

    if (!title || !description ) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field.",
            field: {
                'title': title,
                'description': description
            }
        });
        return;
    }

    const image = req.file.filename;
    socmed.create({ image, title, description, published, fid_user })
        .then(data => {
            res.status(201).send({
                code: 201,
                success: true,
                message: "Create data success.",
            });
            return;
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
        });
}

exports.updateSocmedPublished = (req, res) => {
    const fid_user = req.userid;
    const { id, published } = req.query;

    if (promoID.length == 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'Promoo ID not found'
        })
        return;
    }

    db.socmed.update(
        { published, fid_user },
        { where: { id: id } }
    ).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Data Publish Status Updated."
        });
        return;
    })
}

exports.socmedMaterialUpdate = (req, res) => {
    const fid_user = req.userid;
    const { id } = req.query;
    const { title, description } = req.body;

    if (id.length == 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: 'ID not found'
        })
        return;
    }

    if (req.file) {
        const image = req.file.filename;
        socmed.update(
            { image, title, description, fid_user },
            { where: { id: id } }
        ).then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data Updated."
            });
            return;
        })
    } else {
        socmed.update(
            { title, description, fid_user },
            { where: { id: promoID } }
        ).then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Data Updated."
            });
            return;
        })
    }

}

