const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const SocketService = require("../src/services/socket.service");
const { initRedis } = require("./redis");
const flowService = require("../src/services/flow/flow.service")
let io;

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const initSocket = async (server) => {
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ["websocket", "polling"]
  });

  /* ================= REDIS (OPTIONAL) ================= */

  const redis = await initRedis();
  if (redis) {
    io.adapter(createAdapter(redis.pubClient, redis.subClient));
    console.log("🚀 Socket.IO using Redis adapter");
  } else {
    console.log("🧠 Socket.IO using in-memory adapter");
  }

  /* ================= AUTH ================= */

  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) throw new Error("No cookies");

      const cookies = cookie.parse(cookieHeader);
      const token = cookies.token || cookies.access_token;
      if (!token) throw new Error("No token");

      const payload = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role
      };

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  /* ================= SOCKET EVENTS ================= */

  io.on("connection", (socket) => {
    console.log("👤 Connected:", socket.user.id);

    const socketService = new SocketService(io);
    socketService.userConnected(socket.user.id, socket.id);

    socket.on("join_room", ({ roomId }) => {
      if (!roomId) return;
      socketService.joinRoom(socket, roomId);
      console.log("join room id:", roomId);
    });

    socket.on("leave_room", ({ roomId }) => {
      if (!roomId) return;
      socketService.leaveRoom(socket, roomId);
      console.log("leaved room id:", roomId);
    });


    socket.on("send_message", async ({ roomId, message }) => {
      if (!roomId || !message?.content) return;

      try {
        // Sirf sendMessage call karein. 
        // Flow trigger karne ki logic ab Iske ANDAR (socket.service.js mein) hogi.
        await socketService.sendMessage(socket, roomId, message);

      } catch (error) {
        console.error("Error in send_message listener:", error);
      }
    });

    socket.on("disconnect", () => {
      socketService.userDisconnected(socket.user.id);
    });
  });

  return io;
};

module.exports = { initSocket, getIO };
