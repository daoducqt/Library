import axios from "axios";

export async function getGoogleTokens({ code, clientId, clientSecret, redirectUri }) {
  const url = `https://oauth2.googleapis.com/token`;

  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  const res = await axios.post(url, values, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return res.data; // { access_token, id_token }
}
