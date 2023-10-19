'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    return Promise.all([
      queryInterface.addColumn('events_weddings', 'marriage_location_address', {
        type: Sequelize.DataTypes.TEXT,
      }),
      queryInterface.addColumn('events_weddings', 'ceremony_type', {
        type: Sequelize.DataTypes.TEXT,
      }),
    ]);

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    return Promise.all([
      queryInterface.removeColumn('events_weddings', 'marriage_location_address'),
      queryInterface.removeColumn('events_weddings', 'ceremony_type')
    ]);

  }
};
