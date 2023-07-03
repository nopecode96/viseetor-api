module.exports = (sequelize, Sequelize) => {
  const eventMessage = sequelize.define("events_message", {
    title: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.TEXT
    },
    published: {
      type: Sequelize.BOOLEAN
    },
  });
  return eventMessage;
};