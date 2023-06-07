module.exports = (sequelize, Sequelize) => {
    const masterCompanyStatus = sequelize.define("master_company_status", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterCompanyStatus;
};