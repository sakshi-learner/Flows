require("dotenv").config();
const http = require("http");
const app = require("./app");
const { sequelize } = require("./models");
const startConsumer = require("./kafka/consumer");
const { initSocket } = require("../config/socket.config");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await initSocket(server); // 🔥 IMPORTANT

    startConsumer(); // Kafka can also be made optional later

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
  }
})();
