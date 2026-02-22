"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("oauth_accounts", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      provider: {
        type: Sequelize.STRING(20),
        allowNull: false, // "facebook"
      },

      provider_user_id: {
        type: Sequelize.STRING(100),
        allowNull: false, // Facebook user id
      },

      email_from_provider: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      profile_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      access_token: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      token_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      scope: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });

    await queryInterface.addIndex("oauth_accounts", ["provider", "provider_user_id"], {
      unique: true,
      name: "uq_oauth_provider_user",
    });

    await queryInterface.addIndex("oauth_accounts", ["user_id"], {
      name: "idx_oauth_user_id",
    });

    await queryInterface.addIndex("oauth_accounts", ["provider"], {
      name: "idx_oauth_provider",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("oauth_accounts");
  },
};
