const bookShema = require("../models/book");
const profileShema = require("../models/profiles");

module.exports = {
  name: "follow-book",
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    let user = await profileShema.findOne({
      username: html.username,
      id: html.id,
      email: html.email,
      password: html.password,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    let book = await bookShema.findOne({ name: html.follow });

    if (!book)
      return res.status(400).json({ error: `Could not fetch book data.` });

    if (book.followers.includes(user.id)) {
      let index = book.followers.findIndex((v) => v === user.id);
      book.followers.splice(index, 1);
      book.save();
      return res
        .status(200)
        .json({ success: `Successfully unfollowed ${html.follow}!` });
    } else {
      book.followers.push(user.username);
      book.save();
      return res
        .status(200)
        .json({ success: `Successfully followed ${html.follow}!` });
    }
  },
};
