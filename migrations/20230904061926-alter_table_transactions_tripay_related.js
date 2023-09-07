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
      queryInterface.addColumn('transactions', 'tripay_uuid', {
        type: Sequelize.DataTypes.STRING
      }),
      queryInterface.addColumn('transactions', 'tripay_paycode', {
        type: Sequelize.DataTypes.STRING,
      }),
      queryInterface.addColumn('transactions', 'tripay_response_data', {
        type: Sequelize.DataTypes.JSON,
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
      queryInterface.removeColumn('transactions', 'tripay_uuid'),
      queryInterface.removeColumn('transactions', 'tripay_paycode'),
      queryInterface.removeColumn('transactions', 'tripay_response_data')
    ]);
  }
};
