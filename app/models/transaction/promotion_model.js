module.exports = (sequelize, Sequelize) => {
  const promotionModel = sequelize.define("promotion", {
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    code: {
      type: Sequelize.STRING
    },
    discount: {
      type: Sequelize.DOUBLE
    },
    start_date: {
      type: Sequelize.DATE
    },
    end_date: {
      type: Sequelize.DATE
    },
    usage: {
      type: Sequelize.INTEGER
    },
    published: {
      type: Sequelize.BOOLEAN
    },
  }
  );
  return promotionModel;
};