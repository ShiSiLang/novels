const reviewShema = require("../models/review");
const bookShema = require("../models/book");
const systemSchema = require("../models/system");
const profileShema = require("../models/profiles");
const { trim, getBase64DataUrl } = require("../util.js");
const axios = require("axios");
let webhook_url = process.env.webhook;

module.exports = {
  name: "review",
  run: async (req, res) => {
    //return res.status(400).json({ error: `System currently down!` });

    let html = req.body.data; //type, type2, reviewID, password
    console.log(html);
    if (html.password !== process.env.devPassword)
      return res.status(400).json({ error: `Incorrect password!` });

    if (html.type === "accept") {
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
          description: data.description,
          icon: data.icon,
          tags: data.tags,
          updated: date,
          published: date,
          status: "Ongoing",
        }).save();

        let authorData = await profileShema.findOne({
          id: data.author,
        });

        if (!authorData)
          return res.status(400).json({ error: `User data not found.` });

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
          console.log(data);
          bookData.chapters.push({
            name: data.name,
            intro: data.intro,
            credits: data.credits,
            thumbnail: data.thumbnail,
            type: data.type,
            novel: data.novel,
          });
        } else if (data.type === "Manga" || data.type === "Webtoon") {
          bookData.chapters.push({
            name: data.name,
            intro: data.intro,
            credits: data.credits,
            thumbnail: data.thumbnail,
            type: data.type,
            images: data.images,
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

    if (html.type === "decline") {
      let bookData = await reviewShema.findOne({
        type: html.type2,
        reviewID: html.reviewID,
      });

    console.log(bookData)

      let params = {
        content:
          html.type2 === "Chapter"
            ? `New Chapter: ${html.chapterName} Denied`
            : "New Book Denied",
        embeds: [
          {
            title: bookData.name,
            color: 16711680,
          },
        ],
        username: bookData.name,
      };

      await reviewShema.findOneAndDelete({
        type: html.type2,
        reviewID: html.reviewID,
      });

res.status(200).json({
        success: `Successfully denied the ${html.type2}!.`,
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
      return res.status(400).json({ error: error.message });

      });
    }
  },
};
