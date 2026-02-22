exports.requireOAuthState = (cookieName = "fb_oauth_state") => (req, res, next) => {
  const receivedState = req.query?.state;
  const storedState = req.cookies?.[cookieName];

  if (!receivedState || !storedState || receivedState !== storedState) {
    // clear to avoid reuse
    res.clearCookie(cookieName, { path: "/" });
    return res.redirect(`${process.env.CLIENT_URL}/auth/error?reason=invalid_state`);
  }

  // clear after successful validation (one-time token)
  res.clearCookie(cookieName, { path: "/" });
  next();
};
