const bookShema = require("../models/book");

module.exports = {
  name: "follow-book",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

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
