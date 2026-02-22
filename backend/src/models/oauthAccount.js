"use strict";

module.exports = (sequelize, DataTypes) => {
  const OAuthAccount = sequelize.define(
    "OAuthAccount",
    {
      id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },

      user_id: { type: DataTypes.BIGINT, allowNull: false },

      provider: { type: DataTypes.STRING(20), allowNull: false },

      provider_user_id: { type: DataTypes.STRING(100), allowNull: false },

      email_from_provider: { type: DataTypes.STRING(255), allowNull: true },

      profile_name: { type: DataTypes.STRING(255), allowNull: true },

      access_token: { type: DataTypes.TEXT, allowNull: true },

      token_expires_at: { type: DataTypes.DATE, allowNull: true },

      scope: { type: DataTypes.TEXT, allowNull: true },

      created_at: { type: DataTypes.DATE, allowNull: false },
    },
    {
      tableName: "oauth_accounts",
      timestamps: false, // we only have created_at
      underscored: true,
    }
  );

  OAuthAccount.associate = (models) => {
    OAuthAccount.belongsTo(models.User, { foreignKey: "user_id", as: "user" });
  };

  return OAuthAccount;
};
