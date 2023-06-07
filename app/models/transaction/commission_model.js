module.exports = (sequelize, Sequelize) => {
    const commissionModel = sequelize.define("commission", {
        description: {
            type: Sequelize.TEXT
        },
        nominal: {
            type: Sequelize.DOUBLE
        },
        balance: {
            type: Sequelize.DOUBLE
        },
        action: { //IN or OUT
            type: Sequelize.STRING
        },
        status: { //SATTLE or PENDING or TROUBLE
            type: Sequelize.STRING
        }
    });
    return commissionModel;
};