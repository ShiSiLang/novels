const CLIENT_ID = "1100495054063284354";
const CLIENT_SECRET = process.env.ClientSecret; // replace with your actual client secret
const REDIRECT_URI = "https://novels-production.up.railway.app/access-portal";
const DISCORD_API_BASE_URL = "https://discordapp.com/api";
const axios = require("axios");
const profileShema = require("../models/profiles");

module.exports = {
  name: "access-portal",
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    const code = req.body.code;

    if (!code)
      return res.status(400).send({ error: "Authorization code not found." });

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
  `${DISCORD_API_BASE_URL}/oauth2/token`,
  new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: "authorization_code",
    code: code,
    redirect_uri: REDIRECT_URI,
    scope: "identify email",
  }),
  {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }
);

console.log(tokenResponse.data); // Add this line to check the response data

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
        `${DISCORD_API_BASE_URL}/users/@me`,
        {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!userResponse.status === 200) {
        const errorData = userResponse.data;
        return res
          .status(400)
          .send({ error: `Failed to get user data: ${errorData.error}` });
      }

      const userData = userResponse.data;
      const userId = userData.id;
      const username = userData.username;
      return console.log(userResponse);
      let date = new Date();

      let data = await profileShema.find().sort({ username: 1 });

      if (data.find((v) => v.username === html.uname.replace(/</g, "&lt;"))) {
        /* return res.status(200).json({
        success: `Successfully logged you in.`,
        userIcon: iconLink,
        userAuthor: data.author,
      });*/
        return res
          .status(400)
          .json({ error: `That username is already taken.` });
      }

      let newProfile = new profileShema({
        username: html.uname.replace(/</g, "&lt;"),
        password: html.psw.replace(/</g, "&lt;"),
        icon: null, // Replace this with the user's Discord avatar
        bio: "",
        banner: "https://i.imgur.com/XjWCCeV.png",
        date: date,
        followers: 0,
        discord: null,
        twitter: null,
        author: false,
      }).save();

      return res
        .status(200)
        .json({ success: `${html.uname.replace(/</g, "&lt;")} added!` });
    } catch (error) {
      //console.log(error);
      return res.status(400).send({ error: error.message });
    }
  },
};
