const profileShema = require("../models/profiles");

module.exports = {
  name: "edit-profile",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body;
    console.log(html);

    let userObject = JSON.parse(html.user);

    let data = await profileShema.findOne({
      _id: userObject.dataID,
    });

    if (!data)
      return res.status(400).json({ error: `Could not fetch user data.` });

    if (
      data.username !== userObject.username &&
      data.id !== userObject.id &&
      data.email !== userObject.email
    )
      return res.status(400).json({ error: `Could not fetch user data.` });

    let params = {
      discord: html?.discord || data?.discord || null,
      twitter: html?.twitter || data?.twitter || null,
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

    if (params.bio.length < 2)
      return res.status(400).json({
        error: `Please make sure the bio is larger than 2 chars!`,
      });

    if (params.bio.length > 300)
      return res.status(400).json({
        error: `Please make sure the bio is smaller than 300 chars!`,
      });

    data.discord = params.discord;
    data.twitter = params.twitter;
    data.bio = params.bio;
    data.save();

    return res.status(200).json({ success: `Profile successfully edited.` });
  },
};
