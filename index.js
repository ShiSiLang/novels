const express = require("express");
const novel = require("./starOfLibby");
const comments = require("./models/comments");
const app = express();
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");
const profileShema = require("./models/profiles");
const reviewShema = require("./models/review");
const bookShema = require("./models/book");

const dir = (text) => `${__dirname}/html/${text}.html`;
const link = (input) => `https://novels-production.up.railway.app/${input}`;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (_, res) => res.redirect(link("home")));

app.get("/home", async (_, res) => res.sendFile(dir("home")));

app.get("/sign-in", (_, res) => res.sendFile(dir("sign-in")));

app.get("/sign-up", (_, res) => res.sendFile(dir("sign-up")));

app.get("/discord", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

app.get("/publish", (_, res) => res.sendFile(dir("publish")));

app.get("/explore", async (req, res) => {
  //get data
  res.sendFile(dir("explore"));
});

app.get("/explore/:bookName", async (req, res) => {
  let bookName = req.params.bookName.toLowerCase();
  let book = await bookShema.findOne({ name: bookName });

  if (!book) return res.sendFile(dir("error"));

  let file = fs.readFileSync("./html/book.html", {
    encoding: "utf8",
  });
  file = file.replaceAll("$$name$$", book.name);
  file = file.replaceAll("$$desc$$", book.description);
  file = file.replaceAll("$$author$$", book.author);
  file = file.replaceAll("$$icon$$", book.icon);
  file = file.replaceAll(
    "$$novel$$",
    `'https://novels-production.up.railway.app/data/book/${book.name}'`
  );

  res.send(file);
});

app.get("/read/:chapter", async (req, res) => {
  let chapter = Number(req.params.chapter) || 1;
  let file = fs.readFileSync("./html/sol.html", {
    encoding: "utf8",
  });
  file = file.replace(
    "$$change$$",
    `'https://novels-production.up.railway.app/novel/${Number(chapter) - 1}'`
  );
  file = file.replace("$$change2$$", `${Number(chapter) + 1}`);
  file = file.replace("$$change3$$", `${Number(chapter) - 1}`);
  file = file.replace(
    "$$change4$$",
    novel[chapter - 1]?.chapter || "Chapter Not Found."
  );
  file = file.replaceAll("$$chapter$$", Number(chapter));
  file = file.replace(
    "$$thumbnail$$",
    novel[chapter - 1]?.thumbnail || "https://i.imgur.com/lGLKiVd.png"
  );
  res.send(file);
}); //make sure to change this after publishing StarofLibby on the data

app.get("/novel/:chapter", async (req, res) => {
  let chapter = Number(req.params.chapter);
  let db = await comments.findOne({ password: "ShinpiIsCool" });
  let newObj = {
    comments: db.comments.filter((v) => v.chapter === chapter + 1),
    ...novel[chapter],
  };
  res.send(newObj);
}); //make sure to delete this after publishing StarofLibby on the data

app.get("/data/:type/:other", async (req, res) => {
  let type = req.params.type.toLowerCase();

  if (type === "profiles") {
    let data = await profileShema.find().sort({ username: 1 });
    console.log(data);
    let newObj = data.map((v) => v.username);
    res.send(newObj);
  }
  if (type === "books") {
    let data = await bookShema.find().sort({ name: 1 });
    res.send(data);
  }
  if (type === "book") {
    let bookName = req.params.other.toLowerCase();
    if (!bookName)
      return res.status(400).json({ error: `Please provide a book name` });
    let book = await bookShema.findOne({ name: bookName });
    console.log(book);
    res.send(book);
  }
}); //very important

app.get("/profile/:username", async (req, res) => {
  let username = req.params.username;

  let userData = await profileShema.findOne({ username: username });

  if (!userData) return res.sendFile(dir("error"));

  let file = fs.readFileSync("./html/profile.html", {
    encoding: "utf8",
  });

  let data = await bookShema.find().sort({ name: 1 });

  let comments = data.filter(
    (v) => v.chapters.comments.username === userData.username
  );

  console.log(comments);

  file = file.replaceAll("$$username$$", userData.username);
  file = file.replaceAll("$$avatar$$", userData.icon);
  file = file.replaceAll("$$followers$$", userData.followers);
  file = file.replaceAll("$$comments$$", comments.length);
  file = file.replace("$$discord$$", userData.discord || "#");
  file = file.replace("$$twitter$$", userData.twitter || "#");
  file = file.replace("$$date$$", userData.date);
  file = file.replace(
    "$$profiles$$",
    `'https://novels-production.up.railway.app/data/profiles'`
  );
  res.send(file);
});

app.post("/sign-up", async (req, res) => {
  let html = req.body.data;
  if (html.dp !== process.env.devPassword)
    return res.status(400).json({ error: `Incorrect password!` });

  let image = html.icon.replace(/</g, "&lt;");

  function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  if (isImage(image) === false)
    return res
      .status(400)
      .json({ error: `Please make sure the icon is a valid URL.` });

  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  let data = await profileShema.find().sort({ username: 1 });

  if (data.find((v) => v.username === html.uname.replace(/</g, "&lt;")))
    return res.status(400).json({ error: `That username is already taken.` });

  let newProfile = new profileShema({
    username: html.uname.replace(/</g, "&lt;"),
    password: html.psw.replace(/</g, "&lt;"),
    icon: image,
    date: `${newdate}`,
    followers: 0,
    discord: null,
    twitter: null,
    author: false,
  }).save();

  return res
    .status(200)
    .json({ success: `${html.uname.replace(/</g, "&lt;")} added!` });
});

app.post("/sign-in", async (req, res) => {
  let html = req.body.data;

  let data = await profileShema.findOne({
    username: html.uname.replace(/</g, "&lt;"),
  });

  if (!data)
    return res
      .status(400)
      .json({ error: `Username or password is incorrect.` });

  if (data.password !== html.psw.replace(/</g, "&lt;"))
    return res
      .status(400)
      .json({ error: `Username or password is incorrect.` });

  return res
    .status(200)
    .json({
      success: `Successfully logged you in.`,
      userIcon: data.icon,
      userAuthor: data.author,
    });
});

app.post("/publish-book", async (req, res) => {
  let html = req.body.data;

  let data = await profileShema.findOne({
    password: html.psw,
    username: html.uname,
  });

  if (!data)
    return res.status(400).json({ error: `Incorrect username or password!` });

  let image = html.icon.replace(/</g, "&lt;");

  function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  if (isImage(image) === false)
    return res
      .status(400)
      .json({ error: `Please make sure the icon is a valid URL.` });

  let newID = Date.now();

  let newReview = new reviewShema({
    bookName: html.name.replace(/</g, "&lt;"),
    bookAuthor: html.uname,
    reviewID: newID,
  }).save();

  let webhook = "https://discord.com/api/webhooks/1088629317749198848/g6fbh_lEqmM8gU-Pst2735OFbIGmIjysb_xg1xzZt2lSTe__WCz3zJFvYd0MWVmTe9KA;"
  let payload = {
    content: `New book has been submitted for review.`,
    embeds: [
      {
        title: html.name.replace(/</g, "&lt;"),
        description: html.description.replace(/</g, "&lt;"),
        image: { url: html.icon.replace(/</g, "&lt;") },
        footer: { text: newID },
      }
    ],
    username: "New Book Post"
  };

  axios.post(webhook, payload).then((response) => {
    return res
      .status(200)
      .json({ success: `${html.uname} added!` });
  }).catch((err) => {
    console.log(err)
    return res
      .status(400)
      .json({ error: `An error has occured.` });
  })
});

app.post("/edit", async (req, res) => {
  let html = req.body.data;

  let data = await profileShema.findOne({
    password: html.psw.replace(/</g, "&lt;"),
    username: html.uname.replace(/</g, "&lt;"),
  });

  if (!data)
    return res.status(400).json({ error: `Incorrect username or password!` });

  let params = {
    icon: html?.newicon || data.icon,
    discord: html?.discord || data?.discord || null,
    twitter: html?.twitter || data?.twitter || null,
  };

  function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  if (isImage(params.icon) === false)
    return res
      .status(400)
      .json({ error: `Please make sure the icon is a valid URL.` });

  function isDiscord(url) {
    return /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/.test(
      url
    );
  }

  if (params.discord !== null && isDiscord(params.discord) === false)
    return res
      .status(400)
      .json({ error: `Please make sure the discord link is a valid URL.` });

  function isTwitter(url) {
    return /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/.test(url);
  }

  if (params.twitter !== null && isTwitter(params.twitter) === false)
    return res
      .status(400)
      .json({ error: `Please make sure the twitter link is a valid URL.` });

  data.icon = params.icon;
  data.discord = params.discord;
  data.twitter = params.twitter;
  data.save();

  return res.status(200).json({ success: `Profile successfully edited.` });
});

app.post("/follow", async (req, res) => {
  let html = req.body;
  console.log(html);
  let user = await profileShema.findOne({
    password: html.psw.replace(/</g, "&lt;"),
    username: html.uname.replace(/</g, "&lt;"),
  });
  console.log(user);
  if (!user)
    return res.status(400).json({ error: `Incorrect username or password!` });

  if (user.username === html.follow)
    return res.status(400).json({ error: `You cannot follow yourself!` });

  let user2 = await profileShema.findOne({ username: html.follow });

  if (user.following.includes(html.follow)) {
    user.following.splice(index, 1);
    user2.followers -= 1;
    user.save();
    user2.save();
    return res
      .status(200)
      .json({ success: `Successfully unfollowed ${html.follow}!` });
  } else {
    user.following.push(html.follow);
    user2.followers += 1;
    user.save();
    user2.save();
    return res
      .status(200)
      .json({ success: `Successfully followed ${html.follow}!` });
  }
});

app.post("/comment", async (req, res) => {
  return res
    .status(400)
    .json({ error: `Commenting is disabled at the moment.` });

  let data = await profileShema.find().sort({ username: 1 });
  console.log(data);

  let html = req.body.data; //bookName, index
  let bookData = await bookShema.findOne({ name: html.bookName });

  if (!bookData)
    return res.status(400).json({ error: `Something went wrong.` });

  let user = data.find(
    (v) =>
      v.password === html.psw.replace(/</g, "&lt;") &&
      v.username === html.uname.replace(/</g, "&lt;")
  );
  if (!user)
    return res.status(400).json({ error: `Incorrect username or password!` });

  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  if (!bookData.chapters[html.index])
    return res.status(400).json({ error: `Something went wrong.` });

  bookData.chapters[html.index].push({
    comment: html.comment.replace(/</g, "&lt;"),
    username: user.username,
    date: newdate,
  });

  console.log(bookData.chapters[html.index]);

  bookData.save();

  return res.status(200).json({ success: `Comment Posted!` });
});

app.use((_, res) => res.status(404).sendFile(dir("error")));

app.listen(process.env.PORT || 80, () => {
  console.log("Server Started");
});

console.log(__dirname);

mongoose.set("strictQuery", true);
(async () => {
  await mongoose
    .connect(process.env["mongo"])
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
