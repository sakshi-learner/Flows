'use strict';

module.exports = (sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    'Conversation',
    {
      room_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      flow_id: { type: DataTypes.INTEGER, allowNull: false },
      state: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} }
    },
    { tableName: 'conversations', freezeTableName: true }
  );

  Conversation.associate = (models) => {
    Conversation.belongsTo(models.Room, { foreignKey: 'room_id' });
    Conversation.belongsTo(models.Flow, { foreignKey: 'flow_id' });
    Conversation.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return Conversation;
};