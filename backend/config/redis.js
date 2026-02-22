const { createClient } = require("redis");

let pubClient = null;
let subClient = null;

const initRedis = async () => {
  if (!process.env.REDIS_URL) {
    console.log(" Redis disabled (REDIS_URL not set)");
    return null;
  }

  try {
    pubClient = createClient({ url: process.env.REDIS_URL });
    subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    console.log("✅ Redis connected");
    return { pubClient, subClient };

  } catch (err) {
    console.warn("⚠️ Redis not available, continuing without it");
    pubClient = null;
    subClient = null;
    return null;
  }
};

module.exports = { initRedis };
