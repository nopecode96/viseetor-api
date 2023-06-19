module.exports = (sequelize, Sequelize) => {
    const commissionWithdraw = sequelize.define("commission_withdraw", {
        wd_number: {
            type: Sequelize.STRING
        },
        nominal: {
            type: Sequelize.DOUBLE
        },
        bank_name: {
            type: Sequelize.STRING
        },
        bank_account_name: {
            type: Sequelize.STRING
        },
        bank_account_number: {
            type: Sequelize.STRING
        },
        status: { //SATTLE or PENDING or PROCESS
            type: Sequelize.STRING
        }
    });
    return commissionWithdraw;
};