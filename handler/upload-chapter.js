let webhook_url = process.env.webhook;
const axios = require("axios");
const profileShema = require("../models/profiles");
const reviewShema = require("../models/review");
const { trim, getBase64DataUrl } = require("../util.js");

module.exports = {
  name: "upload-chapter",
  upload: "thumbnail",
  run: async (req, res) => {
   // return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    if (!req.file)
      return res.status(400).json({ error: `Please upload an icon.` });

    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
      password: userObject.password,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    if (user.author !== true)
      return res
        .status(400)
        .json({ error: `Your profile does not have author perms!` });

    let image = html.file.buffer;

    let content = html.content.replace(/</g, "&lt;");
    let newID = Date.now();

    let replaceNumber = 0;
    const replace = req.body.replace === "on";
    if (req.body.replaceNumber > 0) replaceNumber = req.body.replaceNumber;

    let params = {
      content: `New chapter has been submitted for review.`,
      embeds: [
        {
          title: html.name,
          description: trim(content, 4095),
          footer: { text: newID },
        },
      ],
      username: "New Chapter Post",
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
      type: "Chapter",
      reviewID: reviewID,
      book: {
        name: html.bookName.replace(/</g, "&lt;"),
        author: user.id,
      },
      chapter: {
        name: html.chapterName.replace(/</g, "&lt;"),
        intro: html.intro.replace(/</g, "&lt;"),
        credits: html.credits.replace(/</g, "&lt;"),
        thumbnail: image,
        type: "Novel", //Novel
        novel: content, // String for novels
        replace,
        replaceNumber,
      },
    }).save();

    res.status(200).json({
      success: `Successfully published for review! The Staff team will dm your results.`,
    });
  },
};
