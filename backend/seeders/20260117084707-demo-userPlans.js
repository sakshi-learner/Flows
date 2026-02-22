'use strict';
const { v4: uuidv4 } = require('uuid'); // only needed if you want to create UUIDs here

module.exports = {
  async up(queryInterface, Sequelize) {
    // Example: replace these IDs with actual IDs from your DB if needed
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users LIMIT 2;`
    );
    const userRows = users[0];

    const plans = await queryInterface.sequelize.query(
      `SELECT id FROM "Plans" LIMIT 2;`
    );
    const planRows = plans[0];

    if (!userRows.length || !planRows.length) return;

    const data = [
      {
        userId: userRows[0].id,
        planId: planRows[0].id,
        purchaseDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days plan
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        userId: userRows[1].id,
        planId: planRows[1].id,
        purchaseDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 90)), // 90 days plan
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('userPlans', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userPlans', null, {});
  },
};
