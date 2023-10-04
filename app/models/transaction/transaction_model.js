module.exports = (sequelize, Sequelize) => {
    const transactionModel = sequelize.define("transaction", {
        order_number: {
            type: Sequelize.STRING
        },
        qty: {
            type: Sequelize.STRING
        },
        unit_price: {
            type: Sequelize.DOUBLE
        },
        unit_commission: {
            type: Sequelize.DOUBLE
        },
        total_price: {
            type: Sequelize.DOUBLE
        },
        discount_percent: {
            type: Sequelize.DOUBLE
        },
        discount_nominal: {
            type: Sequelize.DOUBLE
        },
        total_before_tax: {
            type: Sequelize.DOUBLE
        },
        tax: {
            type: Sequelize.DOUBLE
        },
        tax_nominal: {
            type: Sequelize.DOUBLE
        },
        total_payment: {
            type: Sequelize.DOUBLE
        },
        total_commission: {
            type: Sequelize.DOUBLE
        },
        status: {
            type: Sequelize.STRING //===== UNPAID, PAID  
        },
        published: {
            type: Sequelize.BOOLEAN
        },
        tripay_uuid: {
            type: Sequelize.STRING
        },
        tripay_paycode: {
            type: Sequelize.STRING
        },
        tripay_response_data: {
            type: Sequelize.JSON
        },
        unit_commission_supervisor: {
            type: Sequelize.DOUBLE
        },
        unit_commission_group_leader: {
            type: Sequelize.DOUBLE
        }
    }
    );
    return transactionModel;
};