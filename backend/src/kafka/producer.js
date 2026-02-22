const { kafka, Partitioners } = require("./kafkaConfig");

let producer = null;
let connected = false;

const sendMessage = async (topic, message) => {
  if (process.env.KAFKA_ENABLED !== "true") {
    console.log("🚫 Kafka disabled, skipping message");
    return;
  }

  try {
    if (!producer) {
      producer = kafka.producer({
        createPartitioner: Partitioners.DefaultPartitioner,
      });
    }

    if (!connected) {
      await producer.connect();
      connected = true;
      console.log("✅ Kafka Producer connected");
    }

    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });

    console.log("📤 Kafka message sent:", topic);
  } catch (err) {
    console.error("⚠️ Kafka producer error, ignoring:", err.message);
  }
};

module.exports = sendMessage;

