const profileShema = require("../models/profiles");

module.exports = {
  name: "profile/:id",
  get: true,
  run: async (req, res) => {
    let id = req.params.id;
    let data = await profileShema.findOne({ id: id });

    if (!data) return res.sendFile(dir("error"));

    let file = fs.readFileSync("./html/profile.html", {
      encoding: "utf8",
    });

    let data = await bookShema.find().sort({ name: 1 });

    let comments = data
      .filter((v) => {
        return (
          v.chapters.filter((e) => {
            return (
              e.comments.filter((c) => {
                return c.id === data.id;
              }).length > 0
            );
          }).length > 0
        );
      })
      .flatMap((v) => {
        return v.chapters.flatMap((e) => {
          return e.comments.filter((c) => {
            return c.id === data.id;
          });
        });
      });

    file = file.replaceAll("$$username$$", data.username);
    file = file.replace("$$banner$$", data.banner);
    file = file.replaceAll(
      "$$avatar$$",
      `https://cdn.discordapp.com/avatars/${id}/${data.avatar}.png`
    );
    file = file.replaceAll("$$followers$$", data.followers);
    file = file.replaceAll("$$comments$$", comments.length);
    file = file.replace("$$discord$$", data.discord || "#");
    file = file.replace("$$twitter$$", data.twitter || "#");
    file = file.replace(
      "$$bio$$",
      userData?.bio || `Welcome to ${data.username}'s profile!`
    );
    file = file.replace("$$date$$", data.date);
    res.send(file);
  },
};
