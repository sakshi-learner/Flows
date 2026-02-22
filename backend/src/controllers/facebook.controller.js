const facebookAuthService = require("../services/facebook/facebookAuth.service");
const authService = require("../services/auth.service");
console.log("authService exports:", Object.keys(authService));
console.log("setAuthCookie typeof:", typeof authService.setAuthCookie);
console.log("generateToken typeof:", typeof authService.generateToken);

exports.facebookStart = (req, res) => {
  const { state, url } = facebookAuthService.start();
  console.log("this is the state and url to redirect ", state)
  console.log("this is the state and url to redirect ", url)

  res.cookie("fb_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1* 60 *60* 1000,
    path: "/",
  });
  console.log("redirectURL..",url);
  return res.redirect(url);
  
};

exports.facebookCallback = async (req, res) => {
  console.log("✅ facebookCallback HIT", req.originalUrl)
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=missing_code`);
    }

    const { user, isNewUser } = await facebookAuthService.callback({ code });

    console.log( "Creating user or existing user",user,isNewUser);

    const token = authService.generateToken(user);
    authService.setAuthCookie(res, token);
    console.log("Set-Cookie header:", res.getHeader("Set-Cookie"));


    const redirectUrl = isNewUser
      ? `${process.env.CLIENT_URL}/auth/success?new_user=true`
      : `${process.env.CLIENT_URL}/auth/success`;

      console.log("redirect uri status", redirectUrl)

    return res.redirect(redirectUrl);
  } catch (err) {
  console.error("❌ oauth_failed error:", err);
  console.error("❌ message:", err?.message);
  console.error("❌ stack:", err?.stack);

  if (err.code === "EMAIL_MISSING") {
    return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=email_missing`);
  }
  return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=oauth_failed`);
}
};
