// routes/google.route.js
const router = require("express").Router();
const ctrl = require("../controllers/google.controller");
const { requireOAuthState } = require("../middlewares/oauth.middleware");

// Route base: /api/oauth/google
router.get("/start", ctrl.googleStart);
router.get("/callback", requireOAuthState("google_oauth_state"), ctrl.googleCallback);

module.exports = router;
