'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('sakshi@123', 10);

    await queryInterface.bulkInsert('users', [
      {
        name: 'Sakshi',
        email: 'sakshi@example.com',
        password: hashedPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', { email: 'sakshi@example.com' }, {});
  }
};
