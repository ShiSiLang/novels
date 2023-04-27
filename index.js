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

app.get("/data/:type/:other", async (req, res) => {
  let type = req.params.type.toLowerCase();
  if (type === "profiles") {
    let data = await profileShema.find().sort({ username: 1 });
    let newObj = data.map((v) => v.username);
    res.send(newObj);
  }
  if (type === "profilebooks") {
    let username = req.params.other;
    if (!username)
      return res.status(400).json({ error: `Please provide a username` });
    let data = await profileShema.findOne({ username: username });
    if (!data) return res.status(400).json({ error: `Not found.` });

    res.send(data.books);
  }
  if (type === "latest") {
    let getSystem = await system.findOne({ id: "6427a45e2d7d901440fc43cf" });
    res.send(getSystem.latestChapters);
  }
  if (type === "books") {
    let data = await bookShema.find().sort({ name: 1 });
    res.send(data);
  }
  if (type === "book") {
    let bookName = req.params.other;
    if (!bookName)
      return res.status(400).json({ error: `Please provide a book name` });
    let book = await bookShema.findOne({ name: bookName });
    if (!book) return res.status(400).json({ error: `Not Found` });

    for (i = 0; i < book.chapters.length; i++) {
      //console.log(book.chapters[i])
      for (i2 = 0; i2 < book.chapters[i].comments.length; i2++) {
        let comment = book.chapters[i].comments[i2];
        let userData = await profileShema.findOne({
          username: comment.username,
        });
        const iconLink = `data:image/png;base64,${userData.icon.toString(
          "base64"
        )}`;
        comment.icon = iconLink;
      }
    }

    res.send(book);
  }
}); //very important

app.get("/profile/:username", async (req, res) => {
  let username = req.params.username.replace(/\s/g, "").toLowerCase();
  let users = await profileShema.find().sort({ username: 1 });
  let userData = users.find(
    (v) => v.username.replace(/\s/g, "").toLowerCase() === username
  );

  if (!userData) return res.sendFile(dir("error"));

  const iconLink = `data:image/png;base64,${userData.icon.toString("base64")}`;

  let file = fs.readFileSync("./html/profile.html", {
    encoding: "utf8",
  });

  let data = await bookShema.find().sort({ name: 1 });

  let comments = data
    .filter((v) => {
      return (
        v.chapters.filter((e) => {
          return (
            e.comments.filter((c) => {
              return c.username === userData.username;
            }).length > 0
          );
        }).length > 0
      );
    })
    .flatMap((v) => {
      return v.chapters.flatMap((e) => {
        return e.comments.filter((c) => {
          return c.username === userData.username;
        });
      });
    });

  file = file.replaceAll("$$username$$", userData.username);
  file = file.replace("$$banner$$", userData?.banner);
  file = file.replaceAll("$$avatar$$", iconLink);
  file = file.replaceAll("$$followers$$", userData.followers);
  file = file.replaceAll("$$comments$$", comments.length);
  file = file.replace("$$discord$$", userData.discord || "#");
  file = file.replace("$$twitter$$", userData.twitter || "#");
  file = file.replace(
    "$$bio$$",
    userData?.bio || `Welcome to ${userData.username}'s profile!`
  );
  file = file.replace("$$date$$", userData.date);
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
