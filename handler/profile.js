const profileShema = require("../models/profiles");
const bookShema = require("../models/book");
const dir = (text) => `/app/html/${text}.html`;
const fs = require("fs");

module.exports = {
  name: "profile/:id",
  get: true,
  run: async (req, res) => {
    let id = req.params.id;
    let user = await profileShema.findOne({ id: id });

    if (!user) return res.sendFile(dir("error"));

    let file = fs.readFileSync("./html/profile.html", {
      encoding: "utf8",
    });

    let data = await bookShema.find().sort({ name: 1 });

    let comments = data
      .filter((v) => {
        return (
          v?.chapters?.filter((e) => {
            return (
              e.comments.filter((c) => {
                return c.id === user.id;
              }).length > 0
            );
          }).length > 0
        );
      })
      .flatMap((v) => {
        return v.chapters.flatMap((e) => {
          return e.comments.filter((c) => {
            return c.id === user.id;
          });
        });
      });

    file = file.replaceAll("$$username$$", user.username);
    file = file.replace("$$banner$$", user.banner);
    file = file.replaceAll(
      "$$avatar$$",
      `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.png`
    );
    file = file.replaceAll("$$followers$$", user.followers);
    file = file.replaceAll("$$comments$$", comments.length);
    file = file.replace("$$discord$$", user.discord || "#");
    file = file.replace("$$twitter$$", user.twitter || "#");
    file = file.replace(
      "$$bio$$",
      user.bio || `Welcome to ${data.username}'s profile!`
    );
    file = file.replace("$$date$$", user.date);
    res.send(file);
  },
};
