const db = require("../models/index.model");
const User = db.user;
const UserType = db.userType;
const UserStatus = db.masterUserStatus;
const jwt = require('jsonwebtoken');
const md5 = require('md5');
const { user } = require("../models/index.model");

exports.logincheck = (req, res) => {
    const { userid, token } = req.body;
    var condition = { id: userid, token: token };

    User.findAll({ where: condition })
        .then(data => {
            if (data.length == 0) {
                res.status(200).send({
                    code: 200,
                    success: false,
                    message: "Logout Now!",
                });
                return;
            }
            res.status(200).send({
                code: 200,
                success: true,
                message: "You are secure Login!",
            });
            return;
        })
        .catch(err => {
            res.status(400).send({
                code: 400,
                success: false,
                message:
                    err.message || "Some error occurred while retrieving data."
            });
        });
}

exports.login = (req, res) => {

    let jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (!req.body.email && !req.body.password) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Please insert your email & password!"
        });
    }

    const email = req.body.email;
    const password = md5(req.body.password);

    User.findAll({
        where: { email: email, password: password }
    }).then(data => {
        if (data.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Wrong Email/Password!',
                data: ''
            });
            return;
        } else {
            let userid = data[0].id;
            let dataToken = {
                userId: userid,
                password: password
            }
            const token = jwt.sign(dataToken, jwtSecretKey);
            const update = {
                token: token,
                lastLogin: Date()
            }

            User.update(update, { where: { id: userid } })
                .then(data2 => {
                    User.findAll({
                        where: { id: userid, published: true },
                        attributes: ['id', 'email', 'name', 'photo', 'token', 'lastLogin', 'fid_user_type', 'fid_user_status'],
                        include: [
                            { model: UserType, attributes: ['id', 'type_name'] },
                            { model: UserStatus, attributes: ['id', 'title'] },
                        ]
                    }).then(data3 => {
                        if (data3.length == 0) {
                            res.status(200).send({
                                code: 200,
                                success: false,
                                message: 'Your Account not Active, please contact Administrator.'
                                // data : data2[0]
                            });
                        } else {
                            const userStatus = data3[0].fid_user_status;
                            const userStatusTitle = data3[0].master_status_user.title;
                            if (userStatus == 1) {
                                res.status(200).send({
                                    code: 200,
                                    success: true,
                                    message: 'Login Success.',
                                    data: data3[0]
                                });
                            } else {
                                res.status(200).send({
                                    code: 200,
                                    success: false,
                                    message: 'Your Account is ' + userStatusTitle + ', please contact Administrator.',
                                });
                            }
                        }
                    }).catch(err => {
                        // console.log(err);
                        res.status(400).send({
                            code: 400,
                            success: false,
                            message: err || "Error response 1."
                        })
                    })
                }).catch(err => {
                    res.status(400).send({
                        code: 400,
                        success: false,
                        message: err || "Error response 2"
                    })
                })
        }
    })
}

exports.registerMarketing = (req, res) => {
    const fid_type = 2;
    const fid_user = 1;
    const fid_user_status = 2;
    const published = true;
    const createdBy = 1;
    const { username, email, phone_number, name, gender, birth_place, birthday, instagram, address, fid_regency, fid_occupation, reference_id } = req.body;
    const parent_id = (reference_id.length == 0) ? '1' : reference_id;

    if (!username || !name || !email || !phone_number || !gender || !birth_place || !birthday || !instagram || !address || !fid_regency || !fid_occupation) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field.",
            field: {
                username: username, name: name, email: email, phone_number: phone_number, gender: gender, birth_place: birth_place, birthday: birthday, instagram: instagram, address: address, fid_regency: fid_regency, fid_occupation: fid_occupation
            }
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
                message: "Email ini sudah terdaftar, silahkan gunakan email lain."
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
                    message: "Nomor WhatsApp Kamu sudah terdaftar, silahkan gunakan Nomor WhatsApp lain."
                });
                return;
            }
            user.create({ username, name, email, fid_user_type, fid_user_status, published, createdBy, parent_id })
                .then(data3 => {
                    const fid_user = data3.id;
                    userProfile.create({ phone_number, gender, birth_place, birthday, instagram, address, fid_regency, fid_occupation, fid_user })
                        .then(data4 => {

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
        return;
    });


}
