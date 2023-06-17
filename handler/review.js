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

        // Send the request to the CDN server
        let request;
        try {
          request = await axios.post(
            "https://lonelyballmediacdn-production.up.railway.app/upload",
            {
              binaryDataArray: [data.icon.toString("base64")],
              password: process.env.devPassword,
            }
          );
        } catch (err) {
          console.log(err);
        }

        let date = new Date();

        let newBook = new bookShema({
          name: data.name,
          author: data.author,
          description: data.description,
          icon: request.data.fileIds[0],
          tags: data.tags,
          updated: date,
          published: date,
          status: "Ongoing",
          views: 1,
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
          if (data.replace) {
            let chapter = bookData.chapters[1 - data.replaceNumber];

            chapter.name = data.name;
            chapter.credits = data.credits;
            chapter.intro = data.intro;
            chapter.novel = data.novel;
          } else {
            bookData.chapters.push({
              name: data.name,
              intro: data.intro,
              credits: data.credits,
              type: data.type,
              novel: data.novel,
            });
          }
        } else if (data.type === "Manga") {
          let binaryDataArray = data.images.map((imageData) =>
            imageData.toString("base64")
          );

          let request;
          try {
            request = await axios.post(
              "https://lonelyballmediacdn-production.up.railway.app/upload",
              {
                binaryDataArray,
                password: process.env.devPassword,
              }
            );
          } catch (err) {
            console.log(err);
          }

          bookData.chapters.push({
            name: data.name,
            type: data.type,
            images: request.data.fileIds,
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
        embeds: [
          {
            title: data.name,
            url: new URL(
              `https://novels-production.up.railway.app/explore/${reviewData.book.name}`
            ).toString(),
            description:
              html.type2 === "Chapter"
                ? `Chapter: ${reviewData.chapter.name} has been accepted!`
                : "Book Accepted!",
            color: 65280,
          },
        ],
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

      let params = {
        embeds: [
          {
            title: bookData.book.name,
            description:
              html.type2 === "Chapter"
                ? `Chapter: ${bookData.chapter.name} has been denied`
                : "Book Denied",
            color: 16711680,
          },
        ],
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
