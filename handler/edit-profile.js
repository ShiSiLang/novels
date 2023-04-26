const profileShema = require("../models/profiles");

module.exports = {
  name: "edit-profile",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    let data = await profileShema.findOne({
      password: html.psw,
      username: html.uname,
    });

    if (!data)
      return res.status(400).json({ error: `Incorrect username or password!` });

    let params = {
      discord: html?.discord || data?.discord || null,
      twitter: html?.twitter || data?.twitter || null,
      banner: html?.banner || data?.banner || null,
      bio: html?.bio?.replace(/</g, "&lt;") || data?.bio || null,
    };

    function isDiscord(url) {
      return /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/.test(
        url
      );
    }

    if (params.discord !== null && isDiscord(params.discord) === false)
      return res
        .status(400)
        .json({ error: `Please make sure the discord link is a valid URL.` });

    function isTwitter(url) {
      return /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/.test(url);
    }

    if (params.twitter !== null && isTwitter(params.twitter) === false)
      return res.status(400).json({
        error: `Please make sure the twitter link is a valid image URL.`,
      });

    let banner = params.banner.replace(/</g, "&lt;");

    if (isImage(banner) === false)
      return res
        .status(400)
        .json({ error: `Please make sure the banner is a valid URL.` });

    data.discord = params.discord;
    data.twitter = params.twitter;
    data.bio = params.bio;
    data.banner = params.banner;
    data.save();

    return res.status(200).json({ success: `Profile successfully edited.` });
  },
};
