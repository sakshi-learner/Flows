// controllers/google.controller.js
const googleAuthService = require("../services/google/googleAuth.service");
const authService = require("../services/auth.service");

exports.googleStart = (req, res) => {
  const { state, url } = googleAuthService.start();

  res.cookie("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production (HTTPS)
    maxAge: 1* 60 *60* 1000,
    path: "/",
  });

  return res.redirect(url);
};

exports.googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=missing_code`);
    }

    const { user, isNewUser } = await googleAuthService.callback({ code });

    const token = authService.generateToken(user);
    authService.setAuthCookie(res, token);

    const redirectUrl = isNewUser
      ? `${process.env.CLIENT_URL}/auth/success?new_user=true`
      : `${process.env.CLIENT_URL}/auth/success`;

    return res.redirect(redirectUrl);
  } catch (err) {
    console.error("❌ google oauth_failed error:", err);

    if (err.code === "EMAIL_MISSING") {
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=email_missing`);
    }
    if (err.code === "EMAIL_NOT_VERIFIED") {
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=email_not_verified`);
    }
    return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=oauth_failed`);
  }
};
