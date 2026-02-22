// // src/kafka/consumer.js
const { kafka } = require("./kafkaConfig");
const sendEmail = require("../utils/sendEmail");

const startConsumer = async () => {
  if (process.env.KAFKA_ENABLED !== "true") {
    console.log("🚫 Kafka consumer disabled");
    return;
  }

  try {
    const consumer = kafka.consumer({ groupId: "email-service" });

    await consumer.connect();
    await consumer.subscribe({ topic: "email-topic", fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const emailData = JSON.parse(message.value.toString());
        console.log("📩 Consuming message:", emailData);

        await sendEmail(
          emailData.to,
          emailData.subject,
          emailData.html
        );
      },
    });

    console.log("✅ Email consumer running...");
  } catch (err) {
    console.error("⚠️ Kafka consumer failed, continuing without it:", err.message);
  }
};

module.exports = startConsumer;
