const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const fbClient = require("./facebook.client");
const userRepo = require("../../repositories/user.repository");
const oauthRepo = require("../../repositories/oauthAccount.repository");
const PROVIDER = "facebook";


const createState = () => crypto.randomBytes(16).toString("hex");


exports.start = () => {
  const state = createState();

  const url = fbClient.buildAuthUrl({
    clientId: process.env.FB_CLIENT_ID,
    redirectUri: process.env.FB_REDIRECT_URI,
    state,
    scope: "email,public_profile",
  });

  return { state, url };
};


exports.callback = async ({ code }) => {
  // 1) code -> token
  const tokenData = await fbClient.exchangeCodeForToken({
    code,
    clientId: process.env.FB_CLIENT_ID,
    clientSecret: process.env.FB_CLIENT_SECRET,
    redirectUri: process.env.FB_REDIRECT_URI,
  });
  console.log("tokenData",tokenData);

  const accessToken = tokenData.access_token;
  const tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  // 2) token -> profile
  const profile = await fbClient.fetchProfile({ accessToken });
  console.log("this is profile data from facebook", profile)

  // 3) enforce email (because your User.email is NOT NULL)
  if (!profile.email) {
    const err = new Error("Facebook email missing");
    err.code = "EMAIL_MISSING";
    throw err;
  }

  // 4) already linked?
  const linked = await oauthRepo.findByProviderUserId(PROVIDER, profile.id);
  if (linked?.user) {
    // update link info
    await oauthRepo.upsertByProviderUser({
      user_id: linked.user.id,
      provider: PROVIDER,
      provider_user_id: profile.id,
      email_from_provider: profile.email,
      profile_name: profile.name || null,
      access_token: accessToken,
      token_expires_at: tokenExpiresAt,
      scope: "email,public_profile",
      created_at: new Date(),
    });

    return { user: linked.user, isNewUser: false };
  }

  // 5) find user by email
  let user = await userRepo.findByEmail(profile.email);
  console.log("found user ", user)
  let isNewUser = false;
  console.log("is new user ", isNewUser)

  

  // 6) create user if not exists
  if (!user) {
    console.log("this excusting line")
    
    isNewUser = true;
    console.log("new user true check", isNewUser)

    // create random password (hashed) so normal password login does not break
    const randomPassword = crypto.randomBytes(32).toString("hex");
    const hashed = await bcrypt.hash(randomPassword, 10);

    user = await userRepo.create({
      name: profile.name || "Facebook User",
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
    provider_user_id: profile.id,
    email_from_provider: profile.email,
    profile_name: profile.name || null,
    access_token: accessToken,
    token_expires_at: tokenExpiresAt,
    scope: "email,public_profile",
    created_at: new Date(),
  });

  return { user, isNewUser: isNewUser };
};
