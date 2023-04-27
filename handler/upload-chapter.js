let webhook_url = process.env.webhook;
const axios = require("axios");
const profileShema = require("../models/profiles");
const reviewShema = require("../models/review");
const { trim, getBase64DataUrl } = require("../util.js");

module.exports = {
  name: "upload-chapter",
  upload: "thumbnail",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body.data;

    if (!html.name || !html)
      return res.status(400).json({ error: `Missing Data!` });
    console.log(html);

    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    if (user.author !== true)
      return res
        .status(400)
        .json({ error: `Your profile does not have author perms!` });
        
    let image = html.file.buffer;

    if (isImage(image) === false)
      return res.status(400).json({
        error: `Please make sure the thumbnail is a valid image URL.`,
      });

    let content = html.content.replace(/</g, "&lt;");
    let newID = Date.now();

    let replace = false;
    let replaceNumber = 0;
    if (data.replace) replace = true;
    if (data.replaceNumber > 0) replaceNumber = data.replaceNumber;

    let params = {
      content: `New chapter has been submitted for review.`,
      embeds: [
        {
          title: html.name,
          description: trim(content, 4095),
          image: { url: getBase64DataUrl(image) },
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
      bookName: html.name,
      bookAuthor: html.uname,
      bookDescription: content,
      bookIcon: image,
      type: "chapter",
      cType: html.type,
      cIntro: html.intro.replace(/</g, "&lt;"),
      cName: html.cname.replace(/</g, "&lt;"),
      cCredits: html.credits.replace(/</g, "&lt;"),
      reviewID: newID,
      replace: replace,
      replaceNumber: 1,
    }).save();

    res.status(200).json({
      success: `Successfully published for review! The Staff team will dm your results.`,
    });
  },
};
