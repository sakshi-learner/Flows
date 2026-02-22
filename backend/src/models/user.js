'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id:
        {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
        },

      name: 
      {
        type: DataTypes.STRING(100),
        allowNull: false
      },

      email:
       {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },

      password: 
      {
        type: DataTypes.STRING,
        allowNull: false
      },

      role: 
      {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user'
      },

      isActive:
       {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'users',       
      timestamps: true          
    }
);

User.associate = (models) => {
  User.hasMany(models.Message, { foreignKey: 'sender_id' });
  User.hasMany(models.RoomMember, { foreignKey: 'user_id' });
  User.belongsToMany(models.Room, { through: models.RoomMember, foreignKey: 'user_id', otherKey: 'room_id' });

  User.hasMany(models.UserPlan, { foreignKey: 'user_id' });
  User.hasMany(models.Flow, { foreignKey: 'user_id' });

  User.hasMany(models.OAuthAccount, {
    foreignKey: "user_id",
    as: "oauthAccounts",
  });
};

  return User;
};



