// routes/auth.routes.js
const express = require("express");
const controller = require("../controllers/auth.controller");

// ✅ IMPORTANT: match how you exported the middleware
// If middleware exports { authenticate, ... } then do this:
const  authenticate  = require("../middlewares/auth.middleware");
const ctrl = require("../controllers/facebook.controller");
const router = express.Router();

// Public routes
router.post("/login", controller.login);
router.post("/register", controller.register);

// Protected routes
router.post("/logout", authenticate, controller.logout);
router.get("/verify", authenticate, controller.verifyToken);

// Refresh
router.post("/refresh", controller.refreshToken);
module.exports = router;
