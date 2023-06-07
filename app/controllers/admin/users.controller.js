const db = require("../../models/index.model");
const User = db.user;
const UserType = db.userType;
const UserStatus = db.masterUserStatus;
const sequelize = require('sequelize');
const md5 = require('md5');

var functions = require("../../../config/function");

exports.findAll = (req, res) => {
    // console.log("User ID : " + req.userid);
    const { page, size, name, user_type_id } = req.query;
    const { limit, offset } = functions.getPagination(page - 1, size);

    if(name && user_type_id){
        var condition = { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%'), fid_user_type: user_type_id} 
    }else if(name){
        var condition =  { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + name + '%')}
    }else if(user_type_id){
        var condition =  { fid_user_type: user_type_id }
    }else {
        null
    }

  
    User.findAndCountAll({
        where: condition, limit, offset,
        order: [
            ['updatedAt', 'DESC'],
        ],
        attributes: ['id', 'email', 'name', 'photo', 'published', 'lastLogin', 'fid_user_type', 'fid_user_status', 'createdAt'],
        include: [
            {
                model: UserType,
                attributes: ['type_name']
            },
            {
                model: UserStatus,
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

exports.createOne = (req, res) => {
    const { name, email, password, fid_user_type, fid_user_status, published, createdBy } = req.body;
  
    if( !name || !email || !password ){
      res.status(200).send({
        code: 200,
        success: false,
        message: "Error Insert: Field."
      });
      return;
    }
    // console.log(password);
    // const pass = md5(password);
    // console.log(pass);
  
    User.create({name, email, password, fid_user_type, fid_user_status, published, createdBy})
    .then(data=>{
      res.status(200).send({
        code: 200,
        success: true,
        message: "Create data success."
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
    });
}
  
exports.findAllUserType = (req, res) => {
    UserType.findAll({where: {published: true}})
    .then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: data
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

exports.findAllUserStatus = (req, res) => {
    UserStatus.findAll({where: {published: true}})
    .then(data => {
        res.status(200).send({
            code: 200,
            success: true,
            message: "Datas Found.",
            data: data
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
  