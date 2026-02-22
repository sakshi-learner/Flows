'use strict';

module.exports = (sequelize, DataTypes) => {
  const Flow = sequelize.define(
    'Flow',
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      name: { type: DataTypes.STRING, allowNull: false },
      definition: { type: DataTypes.JSONB, allowNull: false },
      is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
      is_default: {type: DataTypes.BOOLEAN, defaultValue: true}
    },
    { tableName: 'flows', freezeTableName: true }
  );

  Flow.associate = (models) => {
    Flow.hasMany(models.Conversation, { foreignKey: 'flow_id' });
    Flow.belongsTo(models.User, { foreignKey: 'user_id' });
    

  };

  return Flow;
};