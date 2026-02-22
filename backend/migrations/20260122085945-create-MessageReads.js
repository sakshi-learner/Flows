'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('message_reads', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      message_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'messages', key: 'id' },
        onDelete: 'CASCADE'
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      read_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },

      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addConstraint('message_reads', {
      fields: ['message_id', 'user_id'],
      type: 'unique',
      name: 'unique_message_read'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('message_reads');
  }
};
