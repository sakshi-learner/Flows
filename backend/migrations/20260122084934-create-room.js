'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rooms', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },

      type: { type: Sequelize.ENUM('direct', 'group', 'channel'), defaultValue: 'group' },

      // ✅ this prevents duplicate direct rooms
      direct_key: { type: Sequelize.STRING, allowNull: true, unique: true },

      created_by: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        allowNull: true
      },

      avatar: { type: Sequelize.TEXT },
      is_private: { type: Sequelize.BOOLEAN, defaultValue: false },

      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('rooms');
  }
};
