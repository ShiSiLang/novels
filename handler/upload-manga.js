const profileShema = require("../models/profiles");
const reviewShema = require("../models/review");
const axios = require("axios");
const { trim, getBase64DataUrl } = require("../util.js");
let webhook_url = process.env.webhook;

module.exports = {
  name: "upload-manga",
  fields: [{ name: "pages" }],
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    if (!req.files)
      return res
        .status(400)
        .json({ error: `Please upload an thumbnail and pages.` });

    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
      _id: userObject.dataID,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    if (user.author !== true)
      return res
        .status(400)
        .json({ error: `Your profile does not have author perms!` });

    try {
      // Access form data and uploaded files from req.body and req.files objects respectively
      const bookName = req.body.bookName;
      const chapterType = req.body.type;
      const chapterName = req.body.chapterName.replace(/</g, "&lt;");

      let replaceNumber = 0;
      const replace = req.body.replace === "on";
      if (req.body.replaceNumber > 0) replaceNumber = req.body.replaceNumber;

      const thumbnailPath = req.files.thumbnail[0].buffer;
      const pagesPaths = req.files.pages.map((file) => file.buffer);

      let newID = Date.now();

      let params = {
        content: `New pages chapter has been submitted for review.`,
        embeds: [
          {
            title: bookName,
            description: `Type: ${chapterType}, Name: ${chapterName}`,
            footer: { text: newID },
          },
        ],
        username: "New Pages Chapter Post",
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
        reviewID: newID,
        book: {
          name: bookName,
          author: user.id,
        },
        chapter: {
          name: chapterName,
          thumbnail: thumbnailPath,
          type: chapterType, //Manga/Webtoon
          images: pagesPaths,
          replace,
          replaceNumber,
        },
      }).save();

      res.status(200).json({
        success: `Successfully published for review! The Staff team will dm your results.`,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }
  },
};
