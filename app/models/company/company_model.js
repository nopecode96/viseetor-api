module.exports = (sequelize, Sequelize) => {
    const company = sequelize.define("company", {
      title: {
        type: Sequelize.STRING
      },
      logo: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.STRING
      },
      contact_person: {
        type: Sequelize.STRING
      },
      contact_phone: {
        type: Sequelize.STRING
      },
      contact_email: {
        type: Sequelize.STRING
      }
    }
  );
  return company;
};