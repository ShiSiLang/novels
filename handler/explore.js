const bookShema = require("../models/book");
const profileShema = require("../models/profiles");
const { trim, getTimeDifference } = require("../util.js");
const fs = require("fs");
const dir = (text) => `/app/html/${text}.html`;

module.exports = {
  name: "explore/:bookName",
  get: true,
  run: async (req, res) => {
    let bookName = req.params.bookName.replace(/\s/g, "").toLowerCase();
    let books = await bookShema.find().sort({ name: 1 });
    let book = books.find(
      (v) => v.name.replace(/\s/g, "").toLowerCase() === bookName
    );

    if (!book) return res.sendFile(dir("error"));

    let file = fs.readFileSync("./html/book.html", {
      encoding: "utf8",
    });

    let user = await profileShema.findOne({ id: book.author });

    let bookData = await bookShema.findOne({ name: book.name });
    /*let totalViews = 0;

    bookData.chapters.forEach((e) => {
      let views = e.views;
      if (typeof views === "object" && Object.keys(views).length === 0) {
        views = 0;
      } else if (views === null || views === undefined || isNaN(views)) {
        views = 0;
      }

      totalViews += views;
    });*/

    const totalViews = bookData.chapters.reduce(
      (total, chapter) => total + chapter?.views || 0,
      0
    );

    console.log("Total views:", totalViews);

    file = file.replaceAll("$$name$$", book.name);
    file = file.replaceAll("$$desc$$", book.description);
    file = file.replaceAll("$$authorID$$", book.author);
    file = file.replaceAll("$$author$$", user.username);

    file = file.replaceAll("$$tags$$", book.tags.join(", "));

    file = file.replaceAll(
      "$$icon$$",
      `https://lonelyballmediacdn-production.up.railway.app/image/${book.icon}`
    );
    file = file.replaceAll("$$views$$", totalViews);
    file = file.replaceAll("$$status$$", book.status);
    file = file.replaceAll("$$favorites$$", book.followers.length);
    file = file.replaceAll("$$published$$", getTimeDifference(book.published));
    file = file.replaceAll("$$updated$$", getTimeDifference(book.updated));
    file = file.replaceAll(
      "$$novel$$",
      `'https://novels-production.up.railway.app/data/book/${book.name}'`
    );

    res.send(file);
  },
};
