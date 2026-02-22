"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) add user_id column
    await queryInterface.addColumn("conversations", "user_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    
    await queryInterface.removeConstraint("conversations", "conversations_room_id_key");

    // 3) add composite unique: (room_id, user_id)
    await queryInterface.addConstraint("conversations", {
      fields: ["room_id", "user_id"],
      type: "unique",
      name: "conversations_room_user_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeConstraint("conversations", "conversations_room_user_unique");
    await queryInterface.addConstraint("conversations", {
      fields: ["room_id"],
      type: "unique",
      name: "conversations_room_id_key",
    });
    await queryInterface.removeColumn("conversations", "user_id");
  },
};