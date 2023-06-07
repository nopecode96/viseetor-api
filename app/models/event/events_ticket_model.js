module.exports = (sequelize, Sequelize) => {
    const eventsTicket = sequelize.define("events_ticket_model", {
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.DOUBLE
      },
      quota: {
        type: Sequelize.INTEGER
      },
    }
  );
  return eventsTicket;
};