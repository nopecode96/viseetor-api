module.exports = (sequelize, Sequelize) => {
    const masterEvent = sequelize.define("master_event", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterEvent;
};