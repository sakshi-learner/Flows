const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors")
const authUser=require("./routes/user.routes");
const planRoutes = require('./routes/plan.routes');
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");
const roomRoutes = require('./routes/room.routes');
const messageRoutes = require('./routes/message.routes');
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true,
}));



app.use("/api/auth", authRoutes);
app.use("/api/",authUser);   //add 
app.use("/api/plans", planRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/oauth/facebook", require("./routes/facebook.routes"));
app.use("/api/oauth/google", require("./routes/google.routes"));
app.use('/api/flows', require('./routes/flow.routes'));



app.use((req, res, next) => {
  console.log('➡️', req.method, req.originalUrl);
  next();
});



app.get("/test", (req, res) => {
  res.send("Server is working");
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});
 


module.exports = app;
