module.exports = (sequelize, Sequelize) => {
  const masterEvent = sequelize.define("master_event", {
    title: {
      type: Sequelize.STRING
    },
    sample_message: {
      type: Sequelize.TEXT
    },
    sample_message_barcode: {
      type: Sequelize.TEXT
    },
    published: {
      type: Sequelize.BOOLEAN
    },
  }
  );
  return masterEvent;
};