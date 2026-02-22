const router = require("express").Router();
const ctrl = require("../controllers/facebook.controller");
const { requireOAuthState } = require("../middlewares/oauth.middleware");

// Route base: /api/oauth/facebook
router.get("/start", ctrl.facebookStart);
router.get("/callback", requireOAuthState("fb_oauth_state"), ctrl.facebookCallback);

module.exports = router;
