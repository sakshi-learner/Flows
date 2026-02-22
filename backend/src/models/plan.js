'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    duration: DataTypes.INTEGER,
    description: DataTypes.TEXT,
    isActive: DataTypes.BOOLEAN

  },
  { tableName: 'plans', freezeTableName: true }
);

  Plan.associate = (models) => {
  Plan.hasMany(models.UserPlan, { foreignKey: 'planId' });
  };
  return Plan;
};


