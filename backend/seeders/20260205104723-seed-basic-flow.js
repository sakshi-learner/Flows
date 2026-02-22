'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('flows', [ 
      {
        name: 'Basic Lead Flow',
        definition: JSON.stringify({
          start: "welcome",
          steps: {
            welcome: { type: "send", text: "Hi 👋 Welcome!", next: "ask_name" },
            ask_name: { type: "ask", key: "name", text: "What is your name?", next: "ask_city" },
            ask_city: { type: "ask", key: "city", text: "Which city are you from?", next: "done" },
            done: {
              type: "send",
              text: "Thanks {{name}} ✅ Our team will contact you in {{city}}.",
              end: true
            }
          }
        }),
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('flows', null, {});
  }
};