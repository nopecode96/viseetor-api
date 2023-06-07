module.exports = (sequelize, Sequelize) => {
    const eventsGiftBank = sequelize.define("events_gift_bank", {
      bank_name: {
        type: Sequelize.STRING
      },
      bank_account_number: {
        type: Sequelize.STRING
      },
      bank_account_name: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return eventsGiftBank;
};