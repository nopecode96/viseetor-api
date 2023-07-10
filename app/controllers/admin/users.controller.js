const db = require("../../models/index.model");
const sequelize = require('sequelize');
const md5 = require('md5');

var functions = require("../../../config/function");
const { user, userProfile, userType, masterUserStatus } = require("../../models/index.model");

exports.findAllMarketing = (req, res) => {
    const { page, size, name, username, user_status } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (name && username && user_status) {
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'), username: username, fid_user_status: user_status, fid_user_type: 2 }
    } else if (name && user_status) {
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'), fid_user_status: user_status, fid_user_type: 2 }
    } else if (username && user_status) {
        var condition = { username: username, fid_user_status: user_status, fid_user_type: 2 }
    } else if (name) {
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'), fid_user_type: 2 }
    } else if (username) {
        var condition = { username: username, fid_user_type: 2 }
    } else if (user_status) {
        var condition = { fid_user_status: user_status, fid_user_type: 2 }
    } else {
        var condition = { fid_user_type: 2 }
    }

    user.findAndCountAll({
        where: condition, limit, offset,
        order: [
            ['updatedAt', 'DESC'],
        ],
        attributes: ['id', 'email', 'username', 'name', 'photo', 'published', 'lastLogin', 'fid_user_type', 'fid_user_status', 'createdAt'],
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

exports.findAllUsersAdmin = (req, res) => {
    // console.log("User ID : " + req.userid);
    const { page, size, name, user_type_id } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if (name && user_type_id) {
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'), fid_user_type: user_type_id }
    } else if (name) {
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%') }
    } else if (user_type_id) {
        var condition = { fid_user_type: user_type_id }
    } else {
        null
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
    })
        .then(data => {
            const response = functions.getPagingData(data, page, limit);
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: response
            });
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

exports.createUserMarketing = (req, res) => {
    const { fid_user_admin } = req.userid;
    const fid_user_type = 2;
    const fid_user_status = 2;
    const published = true;
    const createdBy = fid_user_admin;
    const { username, name, phone_number, email, password } = req.body;

    if (!username || !name || !email || !phone_number || !password) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    user.findAll({
        where: { email: email }
    }).then(data => {
        if (data.length > 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Email has already joined, please use other one."
            });
            return;
        }

        userProfile.findAll({
            where: { phone_number: phone_number }
        }).then(data2 => {
            if (data2.length > 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Phone has already joined, please use other one."
                });
                return;
            }

            user.create({ username, name, email, password, fid_user_type, fid_user_status, published, createdBy })
                .then(data3 => {
                    const fid_user = data3.id;
                    userProfile.create({ phone_number, fid_user })
                        .then(data4 => {
                            functions.notificationWhatsApp(phone_number, 'Thank You to join Viseetor.\n\nYour account has been created. Now, you can login to your work platform at: ' + process.env.ADMIN_URL + '.\n\nHappy work,\nViseetor.com\n\nPlease join to Viseetor Partnerhip Telegram at ' + process.env.TELEGRAM_URL)
                            functions.auditLog('POST', 'Create new marketing with name ' + name, 'Any', 'users', data.id, fid_user_admin)
                            res.status(200).send({
                                code: 200,
                                success: true,
                                message: "Create data success."
                            });
                            return;
                        })
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).send({
                        code: 500,
                        success: false,
                        message:
                            err.message || "Some error occurred while retrieving data."
                    });
                });
        })
    })
}
