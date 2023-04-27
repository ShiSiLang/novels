const bookShema = require("../models/book");
const { trim, getTimeDifference } = require("../util.js");
const fs = require("fs");
const dir = (text) => `app/html/${text}.html`;

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

    book.icon = `data:image/png;base64,${book.icon.toString("base64")}`;

    file = file.replaceAll("$$name$$", book.name);
    file = file.replaceAll("$$desc$$", book.description);
    file = file.replaceAll("$$author$$", book.author);
    file = file.replaceAll("$$icon$$", book.icon);
    file = file.replaceAll("$$views$$", book.views);
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
