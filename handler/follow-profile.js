module.exports = {
  name: "follow-profile",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body;
    let user = await profileShema.findOne({
      password: html.psw,
      username: html.uname,
    });
    if (!user)
      return res.status(400).json({ error: `Incorrect username or password!` });

    if (user.username === html.follow)
      return res.status(400).json({ error: `You cannot follow yourself!` });

    let user2 = await profileShema.findOne({ username: html.follow });

    if (user.following.includes(html.follow)) {
      let index = user.following.findIndex((v) => v === html.follow);
      user.following.splice(index, 1);
      user2.followers -= 1;
      user.save();
      user2.save();
      return res
        .status(200)
        .json({ success: `Successfully unfollowed ${html.follow}!` });
    } else {
      user.following.push(html.follow);
      user2.followers += 1;
      user.save();
      user2.save();
      return res
        .status(200)
        .json({ success: `Successfully followed ${html.follow}!` });
    }
  },
};
