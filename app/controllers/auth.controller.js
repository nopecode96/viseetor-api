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
    })
        .then(data => {
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
                        })
                            .then(data3 => {
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
                            })
                            .catch(err => {
                                // console.log(err);
                                res.status(400).send({
                                    code: 400,
                                    success: false,
                                    message: err || "Error response 1."
                                })
                            })
                    })
                    .catch(err => {
                        res.status(400).send({
                            code: 400,
                            success: false,
                            message: err || "Error response 2"
                        })
                    })
            }
        })
}
