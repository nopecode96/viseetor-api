module.exports = (sequelize, Sequelize) => {
    const eventsGuest = sequelize.define("events_guest", {
        barcode: {
            type: Sequelize.STRING
        },
        phone: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        guest_max: {
            type: Sequelize.INTEGER
        },
        guest_actual: {
            type: Sequelize.INTEGER
        },
        attend: {
            type: Sequelize.BOOLEAN
        },
        reason: {
            type: Sequelize.TEXT
        },
        photo: {
            type: Sequelize.TEXT
        },
        invitation_status: {
            type: Sequelize.STRING
        },
        invitation_send_count: {
            type: Sequelize.INTEGER
        },
        barcode_send_count: {
            type: Sequelize.INTEGER
        },
        last_sent_date: {
            type: Sequelize.DATE
        },
    }
    );
    return eventsGuest;
};