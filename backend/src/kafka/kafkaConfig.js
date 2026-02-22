// kafkaConfig.js
const { Kafka, logLevel, Partitioners } = require("kafkajs");

const kafka = new Kafka({
  clientId: "app", 
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
  logLevel: logLevel.INFO,
});

module.exports = { Kafka, kafka, Partitioners };
