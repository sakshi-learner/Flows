'use strict';

module.exports = (sequelize, DataTypes) => {
  const UserPlan = sequelize.define(
    'UserPlan',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users', // matches your table name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      planId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Plans', // matches your table name, case-sensitive
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      purchaseDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'userPlans',
      timestamps: true,
    }
  );

  UserPlan.associate = (models) => {
    UserPlan.belongsTo(models.User, { foreignKey: 'userId' });
    UserPlan.belongsTo(models.Plan, { foreignKey: 'planId' });
  };

  return UserPlan;
};
