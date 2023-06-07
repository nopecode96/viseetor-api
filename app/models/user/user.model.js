module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    username: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    photo: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.TEXT
    },
    published: {
      type: Sequelize.BOOLEAN
    },
    createdBy: {
      type: Sequelize.INTEGER
    },
    lastLogin: {
      type: Sequelize.DATE
    },
  });
  return User;
};