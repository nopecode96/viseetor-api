module.exports = (sequelize, Sequelize) => {
    const masterVillages = sequelize.define("reg_village", {
      name: {
        type: Sequelize.STRING
      },
    }
  );
  return masterVillages;
};