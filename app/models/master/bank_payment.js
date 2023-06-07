module.exports = (sequelize, Sequelize) => {
    const masterBankPayment = sequelize.define("master_bank_payment", {
      bank: {
        type: Sequelize.STRING
      },
      account_number: {
        type: Sequelize.STRING
      },
      account_name: {
        type: Sequelize.STRING
      },
      published: {
        type: Sequelize.BOOLEAN
      },
    }
  );
  return masterBankPayment;
};