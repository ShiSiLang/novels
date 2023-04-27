const CLIENT_ID = "1100495054063284354";
const CLIENT_SECRET = process.env.ClientSecret; // replace with your actual client secret
const REDIRECT_URI = "https://novels-production.up.railway.app/auth/discord/callback";
const axios = require("axios");
const profileShema = require("../models/profiles");

module.exports = {
  name: "auth/discord/callback",
  get: true,
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    const code = req.query.code;

    if (!code)
      return res.status(400).send({ error: "Authorization code not found." });

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
    });

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept-Encoding": "application/x-www-form-urlencoded",
    };

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        `https://discordapp.com/api/oauth2/token`,
        params,
        { headers }
      );

      const tokenData = tokenResponse.data;

      if (!tokenData.access_token) {
        const errorData = tokenResponse.data;
        return res
          .status(400)
          .send({ error: `Failed to get access token: ${errorData.error}` });
      }

      const accessToken = tokenData.access_token;

      // Get the user's ID and username
      const userResponse = await axios.get(
        `https://discordapp.com/api/users/@me`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (userResponse.status !== 200) {
        const errorData = userResponse.data;
        return res
          .status(400)
          .send({ error: `Failed to get user data: ${errorData.error}` });
      }

      const userData = userResponse.data;

      if (userData.verified !== true) {
        return res
          .status(400)
          .send({ error: `Your account is not verified.` });
      }

      const userId = userData.id;
      const username = userData.username;
      const email = userData.email;
      const avatar = userData.avatar;
      const banner = userData.banner;

      let date = new Date();

      let data = await profileShema.findOne({ id: userId });

      if (data) 
        return res.status(200).json({
        success: `Successfully logged you in.`,
        avatar,
        author: data.author,
        id: userId,
        username
      });
      

      let newProfile = new profileShema({
username,
  id: userId,
  email
  avatar,
  banner,
  bio: "",
  date,
  followers: 0,
  discord: null,
  twitter: null,
  author: false,
      }).save();

      return res
        .status(200)
        .json({ success: `${username} added! Redirecting you in a bit` });
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  },
};
