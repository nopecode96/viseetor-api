module.exports = (sequelize, Sequelize) => {
    const events = sequelize.define("events", {
      banner: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      event_video_url: {
        type: Sequelize.STRING
      },
      venue_name: {
        type: Sequelize.STRING
      },
      location_address: {
        type: Sequelize.STRING
      },
      location_coordinate_latitude: {
        type: Sequelize.STRING
      },
      location_coordinate_longitude: {
        type: Sequelize.STRING
      },
      ticketing: {
        type: Sequelize.BOOLEAN
      },
      gift_bank: {
        type: Sequelize.BOOLEAN
      },
      guest: {
        type: Sequelize.BOOLEAN
      },
      invitation_limit: {
        type: Sequelize.INTEGER
      },
      event_date: {
        type: Sequelize.DATE
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return events;
};