//meta api calls...
// const fetch = require("node-fetch");

exports.buildAuthUrl = ({ clientId, redirectUri, state, scope }) => {
  const base = "https://www.facebook.com/v20.0/dialog/oauth";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope, // "email,public_profile"
  });
  return `${base}?${params.toString()}`;
};

exports.exchangeCodeForToken = async ({ code, clientId, clientSecret, redirectUri }) => {
  const url = new URL("https://graph.facebook.com/v20.0/oauth/access_token");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("client_secret", clientSecret);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("code", code);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Token exchange failed");
  return data; // { access_token, expires_in, token_type }
};

exports.fetchProfile = async ({ accessToken }) => {
  const url = new URL("https://graph.facebook.com/me");
  url.searchParams.set("fields", "id,name,email,picture");
  url.searchParams.set("access_token", accessToken);

  const res = await fetch(url.toString());
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Profile fetch failed");
  return data;
};
