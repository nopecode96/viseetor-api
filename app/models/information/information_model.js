module.exports = (sequelize, Sequelize) => {
    const information = sequelize.define("information", {
        title: {
            type: Sequelize.STRING
        },
        content: {
            type: Sequelize.TEXT
        },
        published: {
            type: Sequelize.BOOLEAN
        },
    });
    return information;
};