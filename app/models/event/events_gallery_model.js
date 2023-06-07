module.exports = (sequelize, Sequelize) => {
    const eventsGallery = sequelize.define("events_gallery", {
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return eventsGallery;
};