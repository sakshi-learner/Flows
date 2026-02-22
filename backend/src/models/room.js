module.exports = (sequelize, DataTypes) => {
  const Room = sequelize.define(
    'Room',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: DataTypes.TEXT,
      type: { type: DataTypes.ENUM('direct', 'group', 'channel'), defaultValue: 'group' },
      direct_key: { type: DataTypes.STRING, allowNull: true, unique: true },
      avatar: DataTypes.TEXT,
      is_private: { type: DataTypes.BOOLEAN, defaultValue: false }
    },
    { tableName: 'rooms', freezeTableName: true }
  );

  Room.associate = (models) => {
    Room.belongsTo(models.User, { foreignKey: 'created_by', as: 'creator' });
    Room.hasMany(models.Message, { foreignKey: 'room_id' });
    Room.hasMany(models.RoomMember, { foreignKey: 'room_id' });
    Room.belongsToMany(models.User, { through: models.RoomMember, foreignKey: 'room_id', otherKey: 'user_id' });
  };

  return Room;
};
