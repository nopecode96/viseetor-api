module.exports = (sequelize, Sequelize) => {
  const masterWebTemplate = sequelize.define("master_web_template", {
    image: {
      type: Sequelize.STRING
    },
    title: {
      type: Sequelize.STRING
    },
    template: {
      type: Sequelize.STRING
    },
    published: {
      type: Sequelize.BOOLEAN
    },
  }
  );
  return masterWebTemplate;
};