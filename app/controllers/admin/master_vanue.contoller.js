const db = require("../../models/index.model");
const MasterVanue = db.masterVanue;
const sequelize = require('sequelize');

var functions = require("../../../config/function");

exports.findAll = (req, res) => {
  // console.log(req.userid);
  const { page, size, title } = req.query;
  var condition = title ? { title: sequelize.where(sequelize.fn('LOWER', sequelize.col('title')), 'LIKE', '%' + title + '%') } : null;
  const { limit, offset } = functions.getPagination(page - 1, size);

  MasterVanue.findAndCountAll({
      where: condition, limit, offset,
      order: [
        ['updatedAt', 'DESC'],
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
      message:
        err.message || "Some error occurred while retrieving tutorials."
    });
  });
}

exports.findAllPublished = (req, res) => {
  const { page, size } = req.query;
  const { limit, offset } = functions.getPagination(page, size);
  
  MasterVanue.findAndCountAll({ where: { published: true }, limit, offset })
    .then(data => {
      const response = functions.getPagingData(data, page, limit);
      res.send(response);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials."
    });
  });
};

exports.getDetail = (req, res) => {
  const { id } = req.query;

  MasterVanue.findByPk(id)
  .then(data=>{
    if(!data){
      res.status(200).send({
        code: 200,
        success: false,
        message: "Data is not found."
      });
      return;
    }
    
    res.status(200).send({
      code: 200,
      success: true,
      message: "Data found.",
      data: data
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

exports.createOne = (req, res) => {
  const { title, published } = req.body;

  if(!title){
    res.status(200).send({
      code: 200,
      success: false,
      message: "Please insert title."
    });
    return;
  }

  MasterVanue.create({title, published})
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

exports.update = (req, res) => {
  const { id } = req.query;

  MasterVanue.update(req.body, {where: {id: id}})
  .then(data=>{
    if(data.length == 0){
      res.status(200).send({
        code: 200,
        success: false,
        message: "Update data is failed."
      });
      return;
    }
    
    res.status(200).send({
      code: 200,
      success: true,
      message: "Update data success."
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