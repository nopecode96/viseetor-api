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
      queryInterface.addColumn('master_prices', 'commission_supervisor', {
        type: Sequelize.DataTypes.DOUBLE,
        defaultValue: 0
      }),
      queryInterface.addColumn('master_prices', 'commission_group_leader', {
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
      queryInterface.removeColumn('master_prices', 'commission_supervisor'),
      queryInterface.removeColumn('master_prices', 'commission_group_leader')
    ]);
  }
};
