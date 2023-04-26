const bookShema = require("../models/book");

module.exports = {
  name: "follow-book",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body;
    let user = await profileShema.findOne({
      password: html.psw,
      username: html.uname,
    });
    if (!user)
      return res.status(400).json({ error: `Incorrect username or password!` });

    let book = await bookShema.findOne({ name: html.follow });

    if (book.followers.includes(user.username)) {
      let index = book.followers.findIndex((v) => v === user.username);
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
