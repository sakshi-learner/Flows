module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define(
    'Message',
    {
      type: { type: DataTypes.ENUM('text', 'image', 'file'), defaultValue: 'text' },
      content: { type: DataTypes.TEXT, allowNull: false },
      body: DataTypes.JSONB,
      status: { type: DataTypes.ENUM('sent', 'delivered', 'read'), defaultValue: 'sent' },
      is_edited: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      deleted_at: DataTypes.DATE
    },
    { tableName: 'messages', freezeTableName: true }
  );

  Message.associate = (models) => {
    Message.belongsTo(models.Room, { foreignKey: 'room_id' });
    Message.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
    Message.hasMany(models.MessageRead, { foreignKey: 'message_id' });
    Message.belongsTo(models.Message, { foreignKey: 'reply_to_message_id', as: 'replyTo' });
  };

  return Message;
};
