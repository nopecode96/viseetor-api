module.exports = (sequelize, Sequelize) => {
    const marketingSocmed = sequelize.define("marketing_socmed", {
      image: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    });
    return marketingSocmed;
  };