module.exports = (sequelize, Sequelize) => {
    const masterDistricts = sequelize.define("reg_districts", {
      name: {
        type: Sequelize.STRING
      },
    }
  );
  return masterDistricts;
};