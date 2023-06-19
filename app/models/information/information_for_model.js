module.exports = (sequelize, Sequelize) => {
    const information = sequelize.define("information_for", {
        read: {
            type: Sequelize.BOOLEAN
        },
        published: {
            type: Sequelize.BOOLEAN
        },
    });
    return information;
};