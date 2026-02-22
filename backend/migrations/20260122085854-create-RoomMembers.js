'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('room_members', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },

      room_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'rooms', key: 'id' },
        onDelete: 'CASCADE'
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },

      role: { type: Sequelize.ENUM('owner', 'admin', 'member'), defaultValue: 'member' },
      joined_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },

      last_read_message_id: { type: Sequelize.INTEGER, allowNull: true },

      createdAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addConstraint('room_members', {
      fields: ['room_id', 'user_id'],
      type: 'unique',
      name: 'unique_room_user'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('room_members');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_room_members_role";'
    );
  }
};
