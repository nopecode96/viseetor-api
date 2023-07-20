module.exports = (sequelize, Sequelize) => {
  const eventsAppScan = sequelize.define("events_app_scan", {
    event_code: {
      type: Sequelize.STRING
    },
    passcode: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.TEXT
    },
    limit: {
      type: Sequelize.INTEGER
    },
    published: {
      type: Sequelize.BOOLEAN
    },
  }
  );
  return eventsAppScan;
};