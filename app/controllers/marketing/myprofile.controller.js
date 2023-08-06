const sequelize = require('sequelize');
const fs = require('fs');
const async = require('async');
const md5 = require('md5');

var functions = require("../../../config/function");
const { user, userProfile, regRegencies, masterBank, masterOccupation, userType, masterUserStatus, regProvincies } = require("../../models/index.model");

exports.getAccountDetail = (req, res) => {
    const fid_user = req.userid;

    user.findAll({
        where: { id: fid_user },
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

exports.getDetailEdit = (req, res) => {
    const fid_user = req.userid;

    async.parallel({
        mstBank: function (callback) {
            masterBank.findAll({
                attributes: ['id', 'title'],
            }).then(data => callback(null, data))
        },
        mstRegency: function (callback) {
            regRegencies.findAll({
                attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
                include: {
                    model: regProvincies,
                    attributes: [],
                }
            }).then(data => callback(null, data))
        },
        mstOccupation: function (callback) {
            masterOccupation.findAll({
                attributes: ['id', 'title'],
            }).then(data => callback(null, data))
        },
        dataDetail: function (callback) {
            user.findAll({
                where: { id: fid_user },
                attributes: ['id', 'email', 'name', 'photo', 'published', 'lastLogin', 'createdAt'],
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

            }).then(data => callback(null, data))
        },

    }, function (err, results) {
        if (err) {
            res.status(400).send({
                code: 400,
                success: false,
                message: err.message,
            })
            return;
        }
        if (results.dataDetail.length == 0) {
            res.status(200).send({
                code: 200,
                success: false,
                message: 'Data not found',
            })
            return;
        }

        res.status(200).send({
            code: 200,
            success: true,
            message: 'Data Found',
            data: {
                mstBank: results.mstBank,
                mstRegency: results.mstRegency,
                mstOccupation: results.mstOccupation,
                dataDetail: results.dataDetail[0],
            }
        })
        return;
    })
}

exports.changePassword = (req, res) => {
    const fid_user = req.userid;
    const { password, repassword } = req.body;

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
        { where: { id: fid_user } }
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

exports.update = (req, res) => {
    const fid_user = req.userid;
    const { phone_number, gender, birth_place, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_bank, fid_occupation, fid_regency } = req.body;

    if (!phone_number || !gender || !birth_place || !birthday || !address || !hobbies || !instagram || !facebook || !bank_account_number || !bank_account_name || !fid_bank || !fid_occupation || !fid_regency) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Field."
        });
        return;
    }

    userProfile.findAll({
        where: { fid_user: fid_user }
    }).then(data => {
        console.log(data.length);
        if (data.length > 0) {
            userProfile.update({ phone_number, gender, birth_place, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_bank, fid_occupation, fid_regency }, {
                where: { fid_user: fid_user }
            }).then(data => {
                res.status(202).send({
                    code: 202,
                    success: true,
                    message: "Updated profile success.",
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
        } else {
            userProfile.create({ phone_number, gender, birth_place, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_bank, fid_occupation, fid_regency, fid_user })
                .then(data => {
                    res.status(201).send({
                        code: 201,
                        success: true,
                        message: "Create profile success.",
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
    })
}

exports.changePhoto = (req, res) => {
    const fid_user = req.userid;

    if (!fid_user) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Id not found."
        });
        return;
    }

    const photo = req.file.filename;
    if (!req.file) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Please insert photo."
        });
        return;
    }

    user.update({ photo },
        { where: { id: fid_user } })
        .then(data => {
            res.status(202).send({
                code: 202,
                success: true,
                message: "Updated data success.",
            });
            return;
        })
        .catch(err => {
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



/////////


exports.createProfile = (req, res) => {
    const { phone_number, gender, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_user, fid_bank, fid_occupation, fid_regency } = req.body;

    userProfile.create({ phone_number, gender, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_user, fid_bank, fid_occupation, fid_regency })
        .then(data => {
            res.status(201).send({
                code: 201,
                success: true,
                message: "Create data success.",
            });
            return;
        })
        .catch(err => {
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