module.exports = (sequelize, Sequelize) => {
    const masterOccupation = sequelize.define("master_occupation", {
      title: {
        type: Sequelize.STRING
      },
      sort: {
        type: Sequelize.INTEGER
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterOccupation;
};