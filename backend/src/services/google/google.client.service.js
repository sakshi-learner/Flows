// services/google/google.client.service.js

exports.buildAuthUrl = ({ clientId, redirectUri, state, scope }) => {
  const base = "https://accounts.google.com/o/oauth2/v2/auth";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope, // "openid email profile"
    state,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });

  return `${base}?${params.toString()}`;
};

exports.exchangeCodeForToken = async ({ code, clientId, clientSecret, redirectUri }) => {
  const url = "https://oauth2.googleapis.com/token";

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "Token exchange failed");
  }

  // data: { access_token, expires_in, refresh_token?, scope, token_type, id_token }
  return data;
};

exports.fetchProfile = async ({ accessToken }) => {
  // This endpoint returns: sub, email, email_verified, name, picture, ...
  const url = new URL("https://www.googleapis.com/oauth2/v3/userinfo");

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Profile fetch failed");
  return data;
};
