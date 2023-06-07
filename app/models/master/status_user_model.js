module.exports = (sequelize, Sequelize) => {
    const masterUserStatus = sequelize.define("master_status_user", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterUserStatus;
};