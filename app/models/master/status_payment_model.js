module.exports = (sequelize, Sequelize) => {
    const masterPaymentStatus = sequelize.define("master_status_payment", {
      title: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterPaymentStatus;
};