const sequelize = require('sequelize');
const fs = require('fs');

var functions = require("../../../config/function");
const { user, userProfile, regRegencies, masterBank, masterOccupation, userType, masterUserStatus, regProvincies } = require("../../models/index.model");

exports.getAccountDetail = (req, res) => {
    const { userid } = req.query;

    user.findAll({
        where: { id: userid },
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

    })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Datas Found.",
                data: data[0]
            });
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
}

exports.changePassword = (req, res) => {
    const { password } = req.body;
    const { userid } = req.query;

    user.update({ password }, { where: { id: userid } })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Password has been changed.",
                // data: data[0]
            });
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
}

exports.findAllCity = (req, res) => {
    const { searchValue } = req.query;
    var condition = {
        searchValue: sequelize.where(sequelize.fn('LOWER', sequelize.col('reg_regencie.name')), 'LIKE', '%' + searchValue + '%')
    }

    regRegencies.findAll(
        {
            where: condition,
            // attributes: [['id', 'value'], ['name', 'text']],
            attributes: [['id', 'value'], [sequelize.fn('CONCAT', sequelize.col('reg_regencie.name'), ', ', sequelize.col('reg_province.name')), 'text']],
            include: {
                model: regProvincies,
                // where: condition,
                attributes: [],
            }
        },

    )
        .then(data => {
            // console.log(data);
            res.send(data);
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

exports.findAllOccupation = (req, res) => {

    masterOccupation.findAll(
        {
            attributes: ['id', 'title'],
        }
    )
        .then(data => {
            // console.log(data);
            res.send(data);
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

exports.findAllBank = (req, res) => {
    masterBank.findAll(
        {
            attributes: ['id', 'title'],
        }
    )
        .then(data => {
            // console.log(data);
            res.send(data);
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

exports.createProfile = (req, res) => {
    const { phone_number, gender, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_user, fid_bank, fid_occupation, fid_regency } = req.body;
    // const { id } = req.query;

    // if( !title || !description || !event_date || !vanue_name || !location_address ){
    //   res.status(200).send({
    //     code: 200,
    //     success: false,
    //     message: "Error Insert: Field."
    //   });
    //   return;
    // }

    userProfile.create({ phone_number, gender, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_user, fid_bank, fid_occupation, fid_regency })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Create data success.",
            });
            return;
        })
        .catch(err => {
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

exports.updateProfile = (req, res) => {
    const { phone_number, gender, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_bank, fid_occupation, fid_regency } = req.body;
    const { id } = req.query;


    userProfile.update({ phone_number, gender, birthday, address, hobbies, instagram, facebook, bank_account_number, bank_account_name, fid_bank, fid_occupation, fid_regency },
        {
            where: { id: id }
        })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Updated data success.",
            });
            return;
        })
        .catch(err => {
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

exports.changePhoto = (req, res) => {
    const { id } = req.body;
    const photo = req.file.filename;

    if (!id) {
        res.status(200).send({
            code: 200,
            success: false,
            message: "Error Insert: Id not found."
        });
        return;
    }

    user.update({ photo },
        { where: { id: id } })
        .then(data => {
            res.status(200).send({
                code: 200,
                success: true,
                message: "Updated data success.",
            });
            return;
        })
        .catch(err => {
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


