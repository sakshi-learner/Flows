// services/google/googleAuth.service.js
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const googleClient = require("./google.client.service");
const userRepo = require("../../repositories/user.repository");
const oauthRepo = require("../../repositories/oauthAccount.repository");

const PROVIDER = "google";

const createState = () => crypto.randomBytes(16).toString("hex");

exports.start = () => {
  const state = createState();

  const url = googleClient.buildAuthUrl({
    clientId: process.env.GOOGLE_CLIENT_ID,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    state,
    scope: "openid email profile",
  });

  return { state, url };
};

exports.callback = async ({ code }) => {
  // 1) code -> token
  const tokenData = await googleClient.exchangeCodeForToken({
    code,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });

  const accessToken = tokenData.access_token;
  const tokenExpiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000)
    : null;

  // 2) token -> profile
  const profile = await googleClient.fetchProfile({ accessToken });

  // profile: { sub, email, email_verified, name, picture, ... }

  // 3) enforce email
  if (!profile.email) {
    const err = new Error("Google email missing");
    err.code = "EMAIL_MISSING";
    throw err;
  }

  if (profile.email_verified === false) {
    const err = new Error("Google email not verified");
    err.code = "EMAIL_NOT_VERIFIED";
    throw err;
  }

  // 4) already linked?
  const linked = await oauthRepo.findByProviderUserId(PROVIDER, profile.sub);
  if (linked?.user) {
    // update link info
    await oauthRepo.upsertByProviderUser({
      user_id: linked.user.id,
      provider: PROVIDER,
      provider_user_id: profile.sub,
      email_from_provider: profile.email,
      profile_name: profile.name || null,
      access_token: accessToken,
      refresh_token: tokenData.refresh_token || null, // may be null if Google doesn’t return again
      token_expires_at: tokenExpiresAt,
      scope: tokenData.scope || "openid email profile",
      created_at: new Date(),
    });

    return { user: linked.user, isNewUser: false };
  }

  // 5) find user by email (link accounts)
  let user = await userRepo.findByEmail(profile.email);
  let isNewUser = false;

  // 6) create user if not exists
  if (!user) {
    isNewUser = true;

    // same pattern as facebook: random password to keep normal login safe
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashed = await bcrypt.hash(randomPassword, 10);

    user = await userRepo.create({
      name: profile.name || "Google User",
      email: profile.email,
      password: hashed,
      role: "user",
      isActive: true,
    });
  }

  // 7) link oauth account
  await oauthRepo.upsertByProviderUser({
    user_id: user.id,
    provider: PROVIDER,
    provider_user_id: profile.sub,
    email_from_provider: profile.email,
    profile_name: profile.name || null,
    access_token: accessToken,
    refresh_token: tokenData.refresh_token || null,
    token_expires_at: tokenExpiresAt,
    scope: tokenData.scope || "openid email profile",
    created_at: new Date(),
  });

  return { user, isNewUser };
};
