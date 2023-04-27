const reviewShema = require("../models/review");
const bookShema = require("../models/book");
const systemSchema = require("../models/system");
const profileShema = require("../models/profiles");
const { trim, getBase64DataUrl } = require("../util.js");
let webhook_url = process.env.webhook;

module.exports = {
  name: "review",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body.data; //type1, type2, reviewID, password

    if (html.password !== process.env.devPassword)
      return res.status(400).json({ error: `Incorrect password!` });

    if (html.type1 === "accept") {
      let reviewData = await reviewShema.findOne({
        type: html.type2,
        reviewID: html.reviewID,
      });
      if (!reviewData)
        return res.status(400).json({ error: `Data not found.` });

      let data;
      if (html.type2 === "Book") {
        data = reviewData.book;

        let date = new Date();

        let newBook = new bookShema({
          name: data.name,
          author: data.author,
          description: datacription,
          icon: data.icon,
          updated: date,
          published: date,
          status: "Ongoing",
        }).save();

        let authorData = await profileShema.findOne({
          username: data.author,
        });

        authorData.books.push(data.name);
        authorData.save();
      } else if (html.type2 === "Chapter") {
        data = reviewData.chapter;
        let data2 = reviewData.book;

        let bookData = await bookShema.findOne({
          name: data2.name,
          author: data2.author,
        });

        if (data.type === "Novel") {
          bookData.chapters.push({
            name: data.name,
            intro: data.intro,
            credits: data.credits,
            thumbnail: data.thumbnail,
            type: data.type,
            novel: data.novel,
            comments: [],
          });
        } else if (data.type === "Manga" || data.type === "Webtoon") {
          bookData.chapters.push({
            name: data.name,
            intro: data.intro,
            credits: data.credits,
            thumbnail: data.thumbnail,
            type: data.type,
            images: data.images,
            comments: [],
          });
        }

        bookData.updated = new Date();

        bookData.save();

        //System
        let system = await systemSchema.findOne({
          id: "6427a45e2d7d901440fc43cf",
        });

        if (system.latestChapters.length >= 25) system.latestChapters.pop();
        system.latestChapters.push(reviewData.chapter.name);
        system.save();
      }

      res.status(200).json({
        success: `Successfully published the ${html.type2}!.`,
      });

      let params = {
        content:
          html.type2 === "Chapter"
            ? `New Chapter: ${reviewData.chapter.name}`
            : "New Book Post",
        embeds: [
          {
            title: data.name,
            color: 65280,
          },
        ],
        username: reviewData.book.name,
      };

      await reviewShema.findOneAndDelete({ reviewID: html.reviewID });

      await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(params),
        url: webhook_url,
      }).catch((err) => {
        console.log(err);
      });
    }

    if (html.type1 === "decline") {
      let bookData = await reviewShema.findOne({
        type: html.type2,
        reviewID: html.reviewID,
      });

      res.status(200).json({
        success: `Successfully denied the ${html.type2}!.`,
      });

      let params = {
        content:
          html.type2 === "Chapter"
            ? `New Chapter: ${reviewData.chapter.name} Denied`
            : "New Book Denied",
        embeds: [
          {
            title: data.name,
            color: 16711680,
          },
        ],
        username: reviewData.book.name,
      };

      await reviewShema.findOneAndDelete({
        type: html.type2,
        reviewID: html.reviewID,
      });

      await axios({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: JSON.stringify(params),
        url: webhook_url,
      }).catch((err) => {
        console.log(err);
      });
    }
  },
};
