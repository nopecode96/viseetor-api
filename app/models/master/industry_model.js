module.exports = (sequelize, Sequelize) => {
    const masterIndustry = sequelize.define("master_industry", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterIndustry;
};