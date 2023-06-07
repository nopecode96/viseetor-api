module.exports = (sequelize, Sequelize) => {
    const UserType = sequelize.define("user_type", {
      type_name: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return UserType;
};