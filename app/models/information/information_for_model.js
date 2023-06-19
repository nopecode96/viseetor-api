module.exports = (sequelize, Sequelize) => {
    const information = sequelize.define("information_for", {
        read: {
            type: Sequelize.STRING
        },
        published: {
            type: Sequelize.BOOLEAN
        },
    });
    return information;
};