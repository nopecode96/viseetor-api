module.exports = (sequelize, Sequelize) => {
    const masterRegencies = sequelize.define("reg_regencie", {
      name: {
        type: Sequelize.STRING
      },
    }
  );
  return masterRegencies;
};