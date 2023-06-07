module.exports = (sequelize, Sequelize) => {
    const User = sequelize.define("user_profile", {
      phone_number: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.STRING
      },
      birth_place: {
        type: Sequelize.STRING
      },
      birthday: {
        type: Sequelize.STRING
      },
      address: {
        type: Sequelize.STRING
      },
      hobbies: {
        type: Sequelize.STRING
      },
      instagram: {
        type: Sequelize.STRING
      },
      facebook: {
        type: Sequelize.STRING
      },
      bank_account_number: {
        type: Sequelize.STRING
      },
      bank_account_name: {
        type: Sequelize.STRING
      },

    });
    return User;
  };