const profileShema = require("../models/profiles");
const bookShema = require("../models/book");
const system = require("../models/system");
const reviewShema = require("../models/review");
const { trim, getTimeDifference } = require("../util.js");

module.exports = {
  name: "data/:type/:other",
  get: true,
  run: async (req, res) => {
    let type = req.params.type.toLowerCase();
    if (type === "profiles") {
      let data = await profileShema.find().sort({ username: 1 });
      let newObj = data.map((v) => v.id);
      res.send(newObj);
    }

    if (type === "profile") {
      let id = req.params.other;
      if (!id) return res.status(400).json({ error: `Please provide an id` });
      let data = await profileShema.findOne({ id: id });
      if (!data) return res.status(400).json({ error: `Not found.` });

      let newObj = {
        username: data.username,
        id: data.id,
        avatar: data.avatar,
        banner: data.banner,
        author: data.author,
        books: data.books,
      };

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

      let mapped = reviews.map((v) => {
        if (v.type === "Book") {
          return {
            type: v.type,
            reviewID: v.reviewID,
            book: {
              name: v.book.name,
              description: v.book.description,
              icon: `data:image/png;base64,${v.book.icon.toString("base64")}`,
              author: v.book.author,
            },
          };
        }
        if (v.type === "Chapter") {
          return {
            type: v.type,
            reviewID: v.reviewID,
            chapter: {
              name: v.chapter.name,
              intro: v.chapter.intro,
              credits: v.chapter.credits,
              thumbnail: `data:image/png;base64,${v.chapter.thumbnail.toString(
                "base64"
              )}`,
              type: v.chapter.type,
              novel: v.chapter.novel,
            },
            book: {
              name: v.book.name,
              author: v.book.author,
            },
          };
        }
      });

      res.send(mapped);
    }

    if (type === "books") {
      let data = await bookShema.find().sort({ name: 1 });

      let mapped = data.map((v) => {
        return {
          name: v.name,
          description: v.description,
          icon: `https://lonelyballmediacdn-production.up.railway.app/image/${v.icon}`,
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

      res.send(mapped.forEach(function(v){ delete v.thumbnail });
    }

    if (type === "book") {
      let bookName = req.params.other;
      if (!bookName)
        return res.status(400).json({ error: `Please provide a book name` });
      let book = await bookShema.findOne({ name: bookName });
      if (!book) return res.status(400).json({ error: `Not Found` });

      let newChapters = await Promise.all(
        book.chapters.map(async (v) => {
          let newComments = await Promise.all(
            v.comments.map(async (c) => {
              let comment = c;
              let userData = await profileShema.findOne({
                id: comment.userID,
              });
              return {
                userID: userData.id,
                username: userData.username,
                icon: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`,
                date: getTimeDifference(comment.date),
                comment: comment.comment,
                spoiler: comment?.spoiler === true ? true : false,
              };
            })
          );

          let newOBJ = {
            name: v.name,
            intro: v.intro,
            credits: v.credits,
            thumbnail: `https://lonelyballmediacdn-production.up.railway.app/image/${v.thumbnail}`,
            type: v.type,
            images: v.images,
            novel: v.novel,
            comments: newComments,
          };
          return newOBJ;
        })
      );

      let newBook = {
        name: book.name,
        description: book.description,
        icon: `https://lonelyballmediacdn-production.up.railway.app/image/${v.icon}`,
        author: book.author,
        followers: book.followers,
        tags: book.tags,
        updated: book.updated,
        status: book.status,
        published: book.published,
        views: book.views,
        chapters: newChapters,
      };

      res.send(newBook);
    }
  },
};
