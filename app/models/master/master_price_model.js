module.exports = (sequelize, Sequelize) => {
    const masterPrice = sequelize.define("master_price", {
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      limit_min: {
        type: Sequelize.DOUBLE
      },
      limit_max: {
        type: Sequelize.DOUBLE
      },
      unit_price: {
        type: Sequelize.DOUBLE
      },
      commission: {
        type: Sequelize.DOUBLE
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterPrice;
};