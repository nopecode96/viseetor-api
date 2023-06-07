module.exports = (sequelize, Sequelize) => {
    const masterVanue = sequelize.define("master_vanue", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterVanue;
};