'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('messages', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rooms', key: 'id' },
        onDelete: 'CASCADE'
      },

      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      type: { type: Sequelize.ENUM('text', 'image', 'file', 'system'), defaultValue: 'text' },
      content: { type: Sequelize.TEXT, allowNull: false },
      body: { type: Sequelize.JSONB, allowNull: true },

      reply_to_message_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'messages', key: 'id' },
        onDelete: 'SET NULL'
      },

      status: { type: Sequelize.ENUM('sent', 'delivered', 'read'), defaultValue: 'sent' },
      is_edited: { type: Sequelize.BOOLEAN, defaultValue: false },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },

      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('messages', ['room_id', 'createdAt']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages');
  }
};
