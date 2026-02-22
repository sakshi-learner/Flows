'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conversations', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'rooms',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      flow_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'flows',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },

      state: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('conversations');
  }
};