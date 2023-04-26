const bookShema = require("../models/book");
const profileShema = require("../models/profiles");

module.exports = {
  name: "comment",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body.data; //book, chapter, uname, psw, comment
    let bookData = await bookShema.findOne({ name: html.book });

    if (!bookData)
      return res.status(400).json({ error: `Something went wrong.` });

    let user = await profileShema.findOne({
      password: html.psw,
      username: html.uname,
    });

    if (!user)
      return res.status(400).json({ error: `Incorrect username or password!` });

    let chapterIndex = bookData.chapters.findIndex(
      (v) => v.name === html.chapter
    );

    if (chapterIndex === -1)
      return res.status(400).json({ error: `Something went wrong.` });

    let date = new Date();

    bookData.chapters[chapterIndex].comments.push({
      comment: html.comment.replace(/</g, "&lt;"),
      username: user.username,
      date: date,
    });

    bookData.markModified("chapters");
    await bookData.save();

    return res.status(200).json({ success: `Comment Posted!` });
  },
};
