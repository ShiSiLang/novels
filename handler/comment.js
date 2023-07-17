const bookShema = require("../models/book");
const profileShema = require("../models/profiles");
const jwt = require("jsonwebtoken");

module.exports = {
  name: "comment",
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    let formData = req.body.data;

    const token = formData.token;
    if (!token) return res.status(400).json({ error: `Provide a token.` });

    try {
      const tokenDetails = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log(tokenDetails);
      const userid = tokenDetails._id;

      let bookData = await bookShema.findOne({ name: formData.book });

      if (!bookData)
        return res.status(400).json({ error: `Something went wrong.` });

      let user = await profileShema.findOne({
        _id: userid,
      });

      if (!user)
        return res.status(400).json({ error: `Could not fetch user data.` });

      let chapterIndex = bookData.chapters.findIndex(
        (v) => v.name === formData.chapter
      );

      if (chapterIndex === -1)
        return res.status(400).json({ error: `Something went wrong.` });

      let date = new Date();

      bookData.chapters[chapterIndex].comments.push({
        userID: tokenDetails.userID,
        comment: html.comment.replace(/</g, "&lt;"),
        date: date,
      });

      bookData.markModified("chapters");
      await bookData.save();

      return res.status(200).json({ success: `Comment Posted!` });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: `Token is invalid` });
    }
  },
};
