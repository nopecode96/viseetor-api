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
      queryInterface.addColumn('transactions', 'unit_commission_supervisor', {
        type: Sequelize.DataTypes.DOUBLE,
        defaultValue: 0
      }),
      queryInterface.addColumn('transactions', 'unit_commission_group_leader', {
        type: Sequelize.DataTypes.DOUBLE,
        defaultValue: 0
      })
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
      queryInterface.removeColumn('transactions', 'unit_commission_supervisor'),
      queryInterface.removeColumn('transactions', 'unit_commission_group_leader')
    ]);
  }
};
