module.exports = (sequelize, DataTypes) => {
  const RoomMember = sequelize.define(
    'RoomMember',
    {
      role: {
        type: DataTypes.ENUM('owner', 'admin', 'member'),
        defaultValue: 'member'
      },
      joined_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    {
      tableName: 'room_members',
      freezeTableName: true,
      indexes: [{ unique: true, fields: ['room_id', 'user_id'] }]
    }
  );

  RoomMember.associate = models => {
    RoomMember.belongsTo(models.Room, { foreignKey: 'room_id' });
    RoomMember.belongsTo(models.User, { foreignKey: 'user_id' });
  };

  return RoomMember;
};
