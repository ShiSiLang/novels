const profileShema = require("../models/profiles");
const bookShema = require("../models/book");
const dir = (text) => `/app/html/${text}.html`;
const fs = require("fs");
const { getTimeDifference } = require("../util.js");

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

    let dataComments = [];
    for (let i = 0; i < data.length; i++) {
      const book = data[i];
      for (let ci = 0; ci < book?.chapters?.length; ci++) {
        const chapter = book?.chapters[ci];
        for (let index = 0; index < chapter?.comments?.length; index++) {
          dataComments.push(chapter?.comments[index]);
        }
      }
    }

    console.log(dataComments);

    let comments = data.filter((v) => {
      return v?.chapters?.filter((e) => {
        return e.comments.filter((c) => {
          return c.id === user.id;
        });
      });
    }).length;

    console.log(comments);

    function formatString(content) {
      let step1 = content.split(" ").join(" ").replaceAll("\n\n", "</br></br>");
      let step2 = step1.replaceAll(/\*\*(.*?)\*\*/g, "<b>$1</b>");
      let step3 = step2.replaceAll(/\*(.*?)\*/g, "<em>$1</em>");
      let step4 = step3.replaceAll(/\_(.*?)\_/g, "<ins>$1</ins>");
      return step4;
    }

    file = file.replaceAll("$$username$$", user.username);
    file = file.replaceAll("$$userID$$", user.id);
    file = file.replace(
      "$$banner$$",
      (user.banner =
        user.banner === null
          ? "https://i.imgur.com/XjWCCeV.png"
          : `https://cdn.discordapp.com/banners/${id}/${user.banner}.png`)
    );
    file = file.replaceAll(
      "$$avatar$$",
      `https://cdn.discordapp.com/avatars/${id}/${user.avatar}.png`
    );
    file = file.replaceAll("$$followers$$", user.followers);
    file = file.replaceAll("$$comments$$", comments);
    file = file.replace("$$discord$$", user.discord || "#");
    file = file.replace("$$twitter$$", user.twitter || "#");
    file = file.replace(
      "$$bio$$",
      formatString(user.bio) || `Welcome to ${user.username}'s profile!`
    );
    file = file.replace("$$date$$", getTimeDifference(user.date));
    res.send(file);
  },
};
