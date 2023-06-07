module.exports = (sequelize, Sequelize) => {
    const eventsGuest = sequelize.define("events_wedding", {
        bride_name: {
            type: Sequelize.STRING
        },
        groom_name: {
            type: Sequelize.STRING
        },
        bride_photo: {
            type: Sequelize.STRING
        },
        groom_photo: {
            type: Sequelize.STRING
        },
        bride_parent: {
            type: Sequelize.STRING
        },
        groom_parent: {
            type: Sequelize.STRING
        },
        bride_ig_account: {
            type: Sequelize.STRING
        },
        groom_ig_account: {
            type: Sequelize.STRING
        },
        quote_word: {
            type: Sequelize.TEXT
        },
        music_url: {
            type: Sequelize.STRING
        },
        family_invite: {
            type: Sequelize.TEXT
        }

    }
  );
  return eventsGuest;
};