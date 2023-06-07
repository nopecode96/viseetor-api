module.exports = (sequelize, Sequelize) => {
    const masterBank = sequelize.define("master_bank", {
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
  return masterBank;
};