const profileShema = require("../models/profiles");
const bookShema = require("../models/book");
const system = require("../models/system");
const reviewShema = require("../models/review");

module.exports = {
  name: "data/:type/:other",
  get: true,
  run: async (req, res) => {
    let type = req.params.type.toLowerCase();
    if (type === "profiles") {
      let data = await profileShema.find().sort({ username: 1 });
      let newObj = data.map((v) => v.username);
      res.send(newObj);
    }
    if (type === "profilebooks") {
      let id = req.params.other;
      if (!id)
        return res.status(400).json({ error: `Please provide a username` });
      let data = await profileShema.findOne({ id: id });
      if (!data) return res.status(400).json({ error: `Not found.` });

      res.send(data.books);
    }

    if (type === "latest") {
      let getSystem = await system.findOne({ id: "6427a45e2d7d901440fc43cf" });
      res.send(getSystem.latestChapters);
    }

    if (type === "readingnow") {
      let getSystem = await system.findOne({ id: "6427a45e2d7d901440fc43cf" });
      res.send(getSystem.readingNow);
    }

    if (type === "reviews") {
      let reviews = await reviewShema.find();
      res.send(reviews);
    }

    if (type === "books") {
      let data = await bookShema.find().sort({ name: 1 });

      let mapped = data.map((v) => {
        return {
          name: v.name,
          description: v.description,
          icon: `data:image/png;base64,${v.icon.toString("base64")}`,
          author: v.author,
          tags: v.tags,
          chapters: v.chapters,
          followers: v.followers,
          updated: v.updated,
          status: v.status,
          published: v.published,
          views: v.views,
        };
      });

      res.send(mapped);
    }

    if (type === "book") {
      let bookName = req.params.other;
      if (!bookName)
        return res.status(400).json({ error: `Please provide a book name` });
      let book = await bookShema.findOne({ name: bookName });
      if (!book) return res.status(400).json({ error: `Not Found` });

      book.icon = `data:image/png;base64,${book.icon.toString("base64")}`;

      for (i = 0; i < book.chapters.length; i++) {
        //console.log(book.chapters[i])
        for (i2 = 0; i2 < book.chapters[i].comments.length; i2++) {
          let comment = book.chapters[i].comments[i2];
          let userData = await profileShema.findOne({
            username: comment.username,
          });
          comment.icon = userData.avatar;
        }
      }

      res.send(book);
    }
  },
};
