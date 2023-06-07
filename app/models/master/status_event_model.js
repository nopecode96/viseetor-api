module.exports = (sequelize, Sequelize) => {
    const masterEventStatus = sequelize.define("master_status_event", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterEventStatus;
};