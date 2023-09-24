module.exports = (sequelize, Sequelize) => {
    const eventsWedding = sequelize.define("events_wedding", {
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
        },
        marriage_time: {
            type: Sequelize.DATE
        },
        marriage_location_address: {
            type: Sequelize.TEXT
        },
        marriage_location_map: {
            type: Sequelize.TEXT
        },
        ceremony_type: {
            type: Sequelize.ENUM,
            values: ['None', 'Akad Nikah', 'Pemberkatan', 'Ceremony']
        },

    }
  );
  return eventsWedding;
};