const bookShema = require("../models/book");
const profileShema = require("../models/profiles");

module.exports = {
  name: "comment",
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    let html = req.body.data;

    let bookData = await bookShema.findOne({ name: html.book });

    if (!bookData)
      return res.status(400).json({ error: `Something went wrong.` });

console.log(bookData))

    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
      password: userObject.password,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    let chapterIndex = bookData.chapters.findIndex(
      (v) => v.name === html.chapter
    );

    if (chapterIndex === -1)
      return res.status(400).json({ error: `Something went wrong.` });

    let date = new Date();

    bookData.chapters[chapterIndex].comments.push({
      userID: user.id,
      comment: html.comment.replace(/</g, "&lt;"),
      date: date,
    });

    bookData.markModified("chapters");
    await bookData.save();

    return res.status(200).json({ success: `Comment Posted!` });
  },
};
