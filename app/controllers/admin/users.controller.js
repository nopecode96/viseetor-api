const db = require("../../models/index.model");
const sequelize = require('sequelize');
const md5 = require('md5');
const async = require('async')
const axios = require("axios")
var randomstring = require("randomstring");

var functions = require("../../../config/function");
const { user, userProfile, userType, masterUserStatus, regRegencies, regProvincies, masterBank, masterOccupation } = require("../../models/index.model");

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

exports.createUserMarketing = (req, res) => {
    const fid_user_admin = req.userid;
    const fid_user_type = 2;
    const fid_user_status = 2;
    const published = true;
    const createdBy = fid_user_admin;
    const { username, name, phone_number, email, password_str } = req.body;

    // console.log(fid_user_admin)
    if (!username || !name || !email || !phone_number || !password_str) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    if (username.indexOf(' ') > 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Username cant acceptable white space."
        });
        return;
    }

    user.findAll({
        where: { username: username }
    }).then(dat => {
        if (dat.length > 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: "Username has already used, please use other one."
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
                                const msg0 = 'Hallo ' + name + ', ini adalah pesan resmi dari Viseetor.com.\n\n';
                                const msg1 = 'Terima kasih Kamu sudah mendaftar dalam Program Kemitraan Viseetor. Kamu akan segera menjadi bagian dari Komunitas Mitra Viseetor.\n\n';
                                const msg2 = 'Harap besabar ya, kami akan segera memproses aktivasi akun Kamu.\n\n';
                                const msg3 = 'Sambil menunggu proses aktivasi akun, kamu juga bisa bergabung pada group Komunitas Telegram Mitra Viseetor pada link berikut:\n';
                                const msg4 = process.env.TELEGRAM_URL + '\n\n';
                                const msg5 = 'Salam Sukses Selalu,\n';
                                const msg6 = '*Viseetor Team*\n';
                                const msg7 = 'https://viseetor.com\n\n';
                                const msg8 = 'Balas dengan ketik OK agar dapat membuka link diatas.\n';

                                const msg = msg0 + msg1 + msg2 + msg3 + msg4 + msg5 + msg6 + msg7 + msg8;
                                functions.notificationWhatsAppWithLogo(phone_number, msg);
                                res.status(200).send({
                                    code: 200,
                                    success: true,
                                    message: "Pendaftaran Kamu berhasil terkirim."
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
                        return;
                    });
            }).catch(err => {
                console.log(err);
                res.status(500).send({
                    code: 500,
                    success: false,
                    message:
                        err.message || "Some error occurred while retrieving data."
                });
                return;
            });
        }).catch(err => {
            console.log(err);
            res.status(500).send({
                code: 500,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
            return;
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

exports.findAllSpv = (req, res) => {
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
        var condition = { fid_user_type: 3 }
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

exports.createUserSpv = (req, res) => {
    const fid_user_admin = req.userid;
    const fid_user_type = 3;
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

    if (username.indexOf(' ') > 0) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Username cant acceptable white space."
        });
        return;
    }

    user.findAll({
        where: { username: username }
    }).then(dat => {
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
                                const msg0 = 'Hallo ' + name + ', ini adalah pesan resmi dari Viseetor.com.\n\n';
                                const msg1 = 'Terima kasih Kamu sudah mendaftar dalam Program Kemitraan Viseetor. Kamu akan segera menjadi bagian dari Komunitas Mitra Viseetor.\n\n';
                                const msg2 = 'Harap besabar ya, kami akan segera memproses aktivasi akun Kamu.\n\n';
                                const msg3 = 'Sambil menunggu proses aktivasi akun, kamu juga bisa bergabung pada group Komunitas Telegram Mitra Viseetor pada link berikut:\n';
                                const msg4 = process.env.TELEGRAM_URL + '\n\n';
                                const msg5 = 'Salam Sukses Selalu,\n';
                                const msg6 = '*Viseetor Team*\n';
                                const msg7 = 'https://viseetor.com\n\n';
                                const msg8 = 'Balas dengan ketik OK agar dapat membuka link diatas.\n';

                                const msg = msg0 + msg1 + msg2 + msg3 + msg4 + msg5 + msg6 + msg7 + msg8;
                                functions.notificationWhatsAppWithLogo(phone_number, msg);
                                res.status(200).send({
                                    code: 200,
                                    success: true,
                                    message: "Pendaftaran Kamu berhasil terkirim."
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

exports.getAccountDetail = (req, res) => {
    const fid_user = req.userid;
    const { userid } = req.query;

    if (userid == '1') {
        res.status(401).send({
            code: 401,
            success: false,
            message: 'You not have permission to show this user.',
        })
        return;
    }

    user.findAll({
        where: { id: userid },
        attributes: ['id', 'username', 'email', 'name', 'photo', 'published', 'lastLogin', 'createdAt'],
        include: [
            { model: userType, attributes: ['id', 'type_name'] },
            { model: masterUserStatus, attributes: ['id', 'title'] },
            {
                model: userProfile,
                include: [
                    {
                        model: regRegencies,
                        include: {
                            model: regProvincies
                        }
                    },
                    { model: masterBank },
                    { model: masterOccupation },
                ]
            }
        ]

    }).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: data[0]
        });
    }).catch(err => {
        console.log(err);
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}

exports.activateUser = (req, res) => {
    const fid_user_admin = req.userid;
    const status = 1;
    const { userid } = req.body;

    if (userid == '1') {
        res.status(200).send({
            code: 200,
            success: false,
            message: "You do not permission to update this user."
        });
        return;
    }

    user.findAll({
        where: { id: userid },
        include: {
            model: userProfile
        }
    }).then(data => {
        // console.log(data[0].user_profile.phone_number)
        const nameExt = data[0].name;
        const passwordExt = data[0].password;
        const phoneNumber = data[0].user_profile.phone_number;
        const emailExt = data[0].email;
        const usernameExt = data[0].username;

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

        const password = randomstring.generate({ length: 5 });

        user.update({
            fid_user_status: status,
            password: md5(password)
        }, { where: { id: userid } })
            .then(data2 => {
                const msg0 = 'Hallo ' + nameExt + ', ini adalah pesan resmi dari Viseetor.com.\n\n';
                const msg1 = 'Akun Kamu sudah diaktifkan. Kamu sudah dapat menggunakan Platform Viseetor Partnership.\n';
                const msg2 = 'Berikut adalah detail akun kamu:\n';
                const msg3 = 'Platform : ' + process.env.ADMIN_URL + '\n';
                const msg4 = 'Email : ' + emailExt + '\n';
                const msg5 = 'Password : ' + password + '\n';
                const msg6 = 'Silahkan ganti password Kamu pada Halaman Profil.\n\n';
                const msg7 = 'Selamat bekerja dan raih penghasilan sebanyak-banyaknya.\n\n';
                const msg8 = 'Kamu juga bisa bergabung pada group Komunitas Telegram Mitra Viseetor pada link berikut:\n';
                const msg9 = process.env.TELEGRAM_URL + '\n\n';
                const msg10 = 'Salam Sukses Selalu,\n';
                const msg11 = '*Viseetor Team*\n';
                const msg12 = 'https://viseetor.com\n';
                const msg13 = 'Jika Kamu tidak dapat login, silahkan hubungi Admin Viseetor melalui Group Telegram.\n\n';
                const msg14 = 'Balas dengan ketik OK agar dapat membuka link diatas.\n';

                const msg = msg0 + msg1 + msg2 + msg3 + msg4 + msg5 + msg6 + msg7 + msg8 + msg9 + msg10 + msg11 + msg12 + msg13 + msg14;
                functions.notificationWhatsAppWithLogo(phoneNumber, msg);
                functions.auditLog('PUT', 'Update status User ' + nameExt, 'Any', 'users', data.id, fid_user_admin)
                res.status(200).send({
                    code: 200,
                    success: true,
                    message: "Status Updated."
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

exports.changePassword = (req, res) => {
    const fid_user = req.userid;
    const { userid } = req.query;
    const { password, repassword } = req.body;

    if (!userid) {
        res.status(401).send({
            code: 401,
            success: false,
            message: 'User id not found.',
        })
        return;
    }

    if (userid == '1') {
        res.status(401).send({
            code: 401,
            success: false,
            message: 'You dont have permission to change this account.',
        })
        return;
    }

    if (password !== repassword) {
        res.status(401).send({
            code: 401,
            success: false,
            message: 'Password & Re-Password not match.',
        })
        return;
    }

    const md5password = md5(password);

    user.update(
        { password: md5password },
        { where: { id: userid } }
    ).then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Password has been changed.",
            // data: data[0]
        });
    }).catch(err => {
        console.log(err);
        res.status(400).send({
            code: 400,
            success: false,
            message:
                err.message || "Some error occurred while retrieving data."
        });
    });
}