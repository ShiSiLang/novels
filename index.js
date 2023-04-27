const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");
const profileShema = require("./models/profiles");
const reviewShema = require("./models/review");
const bookShema = require("./models/book");
const system = require("./models/system");
let webhook_url = process.env.webhook;
const {
  trim,
  getTimeDifference,
  isImage,
  getBase64DataUrl,
} = require("./util.js");

const dir = (text) => `${__dirname}/html/${text}.html`;
const link = (input) => `https://novels-production.up.railway.app/${input}`;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

require("./handler")(app);

app.get("/", (_, res) => res.redirect(link("home")));

app.get("/home", async (_, res) => res.sendFile(dir("home")));

app.get("/access-portal", (_, res) => res.sendFile(dir("access-portal")));

app.get("/discord", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

app.get("/upload", (_, res) => res.sendFile(dir("upload")));

app.get("/review", (_, res) => res.sendFile(dir("review")));

app.get("/explore", (_, res) => res.sendFile(dir("explore")));

app.get("/explore/:bookName", async (req, res) => {
  let bookName = req.params.bookName.replace(/\s/g, "").toLowerCase();
  let books = await bookShema.find().sort({ name: 1 });
  let book = books.find(
    (v) => v.name.replace(/\s/g, "").toLowerCase() === bookName
  );

  if (!book) return res.sendFile(dir("error"));

  let file = fs.readFileSync("./html/book.html", {
    encoding: "utf8",
  });

  if (!book?.published) {
    let date = new Date();
    book.updated = date;
    book.published = date;
    await book.save();
  }
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
});

app.get("/read/:bookName/:chapter", async (req, res) => {
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
    "$$novel$$",
    `'https://novels-production.up.railway.app/data/book/${book.name}'`
  );
  file = file.replaceAll("$$book$$", book.name);
  file = file.replaceAll("$$chapter$$", book.chapters[chapter - 1]?.name);
  file = file.replaceAll("$$bookDescription$$", book.description);
  file = file.replaceAll("$$next$$", `${chapter + 1}`);
  file = file.replaceAll("$$previous$$", `${chapter - 1}`);
  file = file.replaceAll(
    "$$thumbnail$$",
    book.icon || "https://i.imgur.com/lGLKiVd.png"
  );
  book.views += 1;
  await book.save();
  res.send(file);
});

app.use((_, res) => res.status(404).sendFile(dir("error")));

app.listen(process.env.PORT || 80, () => {
  console.log("Server Started");
});

console.log(__dirname);

mongoose.set("strictQuery", true);
(async () => {
  await mongoose
    .connect(process.env["mongo"], {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("Connected to mongodb"));
})();

process.on("unhandledRejection", (reason, p) => {
  console.log(" [antiCrash] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [antiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [antiCrash] :: Multiple Resolves");
  console.log(type, promise, reason);
});
