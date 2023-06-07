module.exports = (sequelize, Sequelize) => {
    const masterProvinces = sequelize.define("reg_province", {
      name: {
        type: Sequelize.STRING
      },
    }
  );
  return masterProvinces;
};