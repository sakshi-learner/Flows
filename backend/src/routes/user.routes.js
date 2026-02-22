const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authenticate = require("../middlewares/auth.middleware");


// 🔐  Register user 
router.post(
  "/add",
  userController.addUser
);

// ✅ Get all users except me (JWT protected)
router.get("/users", authenticate, userController.getUserList);

module.exports = router;
