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

      let file = fs.readFileSync("./html/read.html", {
        encoding: "utf8",
      });

      file = file.replaceAll(
        "$$data$$",
        `'https://novels-production.up.railway.app/data/book/${book.name}'`
      );
      file = file.replaceAll("$$book$$", book.name);
      file = file.replaceAll("$$chapter$$", book.chapters[chapter - 1]?.name);
      file = file.replaceAll("$$bookDescription$$", book.description);
      file = file.replaceAll("$$next$$", `${chapter + 1}`);
      file = file.replaceAll("$$previous$$", `${chapter - 1}`);
      file = file.replaceAll(
        "$$icon$$",
        `https://lonelyballmediacdn-production.up.railway.app/image/${book.icon}`
      );

      async function addBook(book) {
        let getSystem = await system.findOne({
          id: "6427a45e2d7d901440fc43cf",
        });

        if (!getSystem.readingNow.includes(book)) {
          getSystem.readingNow.push(book);
        }
        await getSystem.save();
      }

      addBook(book.name);

      res.send(file);

      let bookData = await bookShema.findOne({ name: book.name });
      
      if (!bookData.chapters[chapter - 1].views)
        bookData.chapters[chapter - 1].views = 1;
      else bookData.chapters[chapter - 1].views++;

      console.log(bookData.chapters[chapter - 1].views);
      await bookData.save();
    } catch (err) {
      console.log(err);
    }
  },
};
