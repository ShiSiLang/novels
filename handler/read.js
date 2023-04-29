const bookShema = require("../models/book");
const system = require("../models/system");
const { trim, getTimeDifference } = require("../util.js");
const fs = require("fs");
const dir = (text) => `/app/html/${text}.html`;

module.exports = {
  name: "read/:bookName/:chapter",
  get: true,
  run: async (req, res) => {
    try {
      let chapter = Number(req.params.chapter) || 1;
      let bookName = req.params.bookName.replace(/\s/g, "").toLowerCase();
      let books = await bookShema.find().sort({ name: 1 });
      let book = books.find(
        (v) => v.name.replace(/\s/g, "").toLowerCase() === bookName
      );

      if (!book) return res.sendFile(dir("error"));

      console.log(book.views);

      let file = fs.readFileSync("./html/read.html", {
        encoding: "utf8",
      });

      let j = { icon: `data:image/png;base64,${book.icon.toString("base64")}` };

      file = file.replaceAll(
        "$$novel$$",
        `'https://novels-production.up.railway.app/data/book/${book.name}'`
      );
      file = file.replaceAll("$$book$$", book.name);
      file = file.replaceAll("$$chapter$$", book.chapters[chapter - 1]?.name);
      file = file.replaceAll("$$bookDescription$$", book.description);
      file = file.replaceAll("$$next$$", `${chapter + 1}`);
      file = file.replaceAll("$$previous$$", `${chapter - 1}`);
      file = file.replaceAll("$$thumbnail$$", j.icon);

      async function addBook(book) {
        let getSystem = await system.findOne({
          id: "6427a45e2d7d901440fc43cf",
        });

        if (!getSystem?.readingNow.includes(book)) {
          getSystem.readingNow.push(book);
        }
        await getSystem.save();
      }

      addBook(book.name);

      res.send(file);

      book.views += 1;
      await book.save();
    } catch (err) {
      console.log(err);
    }
  },
};
