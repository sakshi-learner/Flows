module.exports = (sequelize, DataTypes) => {
  const MessageRead = sequelize.define(
    'MessageRead',
    {
      read_at: { type: DataTypes.DATE, allowNull: false }
    },
    {
      tableName: 'message_reads',
      freezeTableName: true,
      indexes: [{ unique: true, fields: ['message_id', 'user_id'] }]
    }
  );

  MessageRead.associate = models => {
    MessageRead.belongsTo(models.Message, { foreignKey: 'message_id' });
    MessageRead.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return MessageRead;
};
