let webhook_url = process.env.webhook;
const axios = require("axios");
const profileShema = require("../models/profiles");
const reviewShema = require("../models/review");
const { trim, getBase64DataUrl } = require("../util.js");

module.exports = {
  name: "upload-book",
  upload: "icon",
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    if (!req.file)
      return res.status(400).json({ error: `Please upload an icon.` });
console.log(html.user)
    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
    });

    console.log(user)

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    if (user.author !== true)
      return res
        .status(400)
        .json({ error: `Your profile does not have author perms!` });

    let icon = req.file.buffer;

    let reviewID = Date.now();

    let params = {
      content: `New book has been submitted for review.`,
      embeds: [
        {
          title: html.name.replace(/</g, "&lt;"),
          description: trim(html.description.replace(/</g, "&lt;"), 4095),
          image: { url: getBase64DataUrl(icon) },
          footer: { text: reviewID },
        },
      ],
      username: "New Book Upload",
    };

    await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(params),
      url: webhook_url,
    }).catch((err) => {
      console.log(err);
      return res.status(400).json({ error: `An error has occured.` });
    });

    let newReview = new reviewShema({
      type: "Book",
      reviewID: reviewID,
      book: {
        name: html.name.replace(/</g, "&lt;"),
        description: html.description.replace(/</g, "&lt;"),
        icon: icon,
        author: user.id,
      },
    }).save();

    res.status(200).json({
      success: `Successfully published for review! The Staff team will dm your results.`,
    });
  },
};
