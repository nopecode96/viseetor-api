const db = require("../../models/index.model");
const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")

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

exports.createUserMarketing = (req, res) => {
    const fid_user_admin = req.userid;
    const fid_user_type = 2;
    const fid_user_status = 2;
    const published = true;
    const createdBy = fid_user_admin;
    const { username, name, phone_number, email, password_str } = req.body;

    console.log(fid_user_admin)
    if (!username || !name || !email || !phone_number || !password_str) {
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
            let password = md5(password_str);
            user.create({ username, name, email, password, fid_user_type, fid_user_status, published, createdBy })
                .then(data3 => {
                    const fid_user = data3.id;
                    userProfile.create({ phone_number, fid_user })
                        .then(data4 => {
                            const msg1 = 'Selamat, Kamu sudah bergabung dalam program kemitraan Viseetor.\n\n';
                            const msg2 = 'Kamu sudah dapat mulai bekerja menggunakan platform Viseetor Pathnership App.\n';
                            const msg3 = 'Berikut adalah detil akun kamu:\n';
                            const msg4 = 'Platform : ' + process.env.ADMIN_URL + '\n';
                            const msg5 = 'Email : ' + email + '\n';
                            const msg6 = 'Password : ' + password + '\n\n';
                            const msg7 = 'Selamat bekerja dan raih penghasilan sebanyak-banyaknya.\n\n';
                            const msg8 = 'Kamu juga bisa bergabung pada group Komunitas Telegram Mitra Viseetor pada link berikut:\n';
                            const msg9 = process.env.TELEGRAM_URL + '\m\n';
                            const msg10 = 'Salam Sukses Selalu,\n';
                            const msg11 = '*Viseetor Team*';

                            functions.notificationWhatsApp(phone_number, msg1 + msg2 + msg3 + msg4 + msg5 + msg6 + msg7 + msg8 + msg9 + msg10 + msg11);
                            functions.auditLog('POST', 'Create new marketing with name ' + name, 'Any', 'users', data.id, fid_user_admin)
                            res.status(200).send({
                                code: 200,
                                success: true,
                                message: "Create data success."
                            });
                            return;
                        })
                }).catch(err => {
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

exports.updateStatusUserMarketing = (req, res) => {
    const { userid, status } = req.body;

    if (userid == '1') {
        res.status(200).send({
            code: 200,
            success: false,
            message: "You do not permission to update this user."
        });
        return;
    }

    user.findAll({
        where: { id: userid }
    }).then(data => {
        if (data[0].fid_user_type == '1') {
            res.status(200).send({
                code: 200,
                success: false,
                message: "You do not permission to update this user."
            });
            return;
        }

        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "User Not Found."
            });
            return;
        }

        user.update({
            fid_user_status: status
        }, { where: { id: userid } })
            .then(data2 => {
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Status updated."
                });
                return;
            }).catch(err => {
                console.log(err);
                res.status(500).send({
                    code: 500,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
            });
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            code: 500,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}