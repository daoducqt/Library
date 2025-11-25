
const excecute = (req, res) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = {
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: ["openid", "email", "profile"].join(" "),
  };

  const qs = new URLSearchParams(options);

  return res.send({
    url: `${rootUrl}?${qs.toString()}`,
  });
};

export default { excecute };
