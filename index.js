const express = require("express");
const novel = require("./starOfLibby");
const app = express();
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");
const profileShema = require("./models/profiles");
const reviewShema = require("./models/review");
const bookShema = require("./models/book");
const path = require('path');
let webhook_url = process.env.webhook;
let latestChapters = [];
const multer = require("multer");

/*
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 5*1024*1024 } });
*/

const storage = multer.memoryStorage();

const upload = multer({ storage: storage, limits: { fileSize: 5*1024*1024 } });

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

app.get("/read/:book/:chapter", async (req, res) => {
  let chapter = Number(req.params.chapter) || 1;
  let bookName = req.params.book;

  if (!bookName) return res.sendFile(dir("error"));

  let file = fs.readFileSync("./html/read.html", {
    encoding: "utf8",
  });

  let book = await bookShema.findOne({ name: bookName });

  if (!book) return res.sendFile(dir("error"));

  file = file.replace(
    "$$novel$$",
    `'https://novels-production.up.railway.app/data/book/${book.name}'`
  );
  file = file.replaceAll("$$book$$", book.name);
  file = file.replaceAll("$$chapter$$", book.chapters[chapter - 1]?.name);
  file = file.replaceAll(
    "$$bookDescription$$",
    book.chapters[chapter - 1]?.description
  );
  file = file.replaceAll("$$next$$", `${chapter + 1}`);
  file = file.replaceAll("$$previous$$", `${chapter - 1}`);
  file = file.replaceAll(
    "$$thumbnail$$",
    book.icon || "https://i.imgur.com/lGLKiVd.png"
  );
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
    res.send(latestChapters);
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

    /*
    rating
    const total = (book.r1 + book.r2 + book.r3 + book.r4 + book.r5)
    const WA = ((1 * book.r1) + (2 * book.r2) + (3 * book.r3) + (5 * book.r5))/(total)
    console.log(Math.round(WA)) // 2
    */

    for (i = 0; i < book.chapters.length; i++) {
      for (i2 = 0; i2 < book.chapters[i].comments.length; i2++) {
        let comment = book.chapters[i].comments[i2];
        let userData = await profileShema.findOne({
          username: comment.username,
        });
        comment.icon = userData.icon;
      }
    }

    res.send(book);
  }
}); //very important

app.get("/review/:type/:type2/:reviewID/:password", async (req, res) => {
  let type = req.params.type.toLowerCase();
  let type2 = req.params.type2.toLowerCase();
  let pass = req.params.password;

  if (pass !== process.env.devPassword)
    return res.status(400).json({ error: `Incorrect password!` });

  let ID = req.params.reviewID;
  if (!ID) return res.status(400).json({ error: `Please provide a book name` });

  if (type === "accept" || type === "approve" || type === "allow") {
    let data = await reviewShema.findOne({ type: type2, reviewID: ID });
    if (!data) return res.status(400).json({ error: `Not found` });

    let bookData;
    if (type2 === "book") {
      let newBook = new bookShema({
        name: data.bookName,
        author: data.bookAuthor,
        description: data.bookDescription,
        icon: data.bookIcon,
      }).save();

      bookData = await newBook;
      let authorData = await profileShema.findOne({
        username: bookData.author,
      });
      authorData.books.push(bookData.name);
      authorData.save();
    } else {
      bookData = await bookShema.findOne({
        name: data.bookName,
        author: data.bookAuthor,
      });

      bookData.chapters.push({
        name: data.cName,
        intro: data.cIntro,
        credits: data.cCredits,
        thumbnail: data.bookIcon,
        type: data.cType,
        content: data.bookDescription,
        comments: [],
      });

      bookData.save();

      if (latestChapters.length >= 25) latestChapters.pop();
      latestChapters.push(data.cName);
    }

    res.status(200).json({
      success: `Successfully published the ${type2}!.`,
    });

    let params = {
      content: `Book/Chapter accepted!.`,
      embeds: [
        {
          title: bookData.name,
          color: 65280,
        },
      ],
      username: type2 === "chapter" ? `${data.cName}` : "New Book Post",
    };

    await reviewShema.findOneAndDelete({ reviewID: ID });

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

  if (type === "deny") {
    await reviewShema.findOneAndDelete({ type: type2, reviewID: ID });

    res.status(200).json({
      success: `Successfully denied the ${type2}!.`,
    });

    let params = {
      content: `Book/Chapter Denied!.`,
      embeds: [
        {
          title: bookData.name,
          color: 16711680,
        },
      ],
      username: type2 === "chapter" ? "New Chapter Post" : "New Book Post",
    };
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
});

app.get("/profile/:username", async (req, res) => {
  let username = req.params.username.replace(/\s/g, "").toLowerCase();
  let users = await profileShema.find().sort({ username: 1 });
  let userData = users.find(
    (v) => v.username.replace(/\s/g, "").toLowerCase() === username
  );

  if (!userData) return res.sendFile(dir("error"));

  console.log(userData.icon)

  let iconBuffer = Buffer.from(userData.icon, 'base64')
  console.log(iconBuffer)

  res.setHeader("Content-Type", "image/png")
  return res.send(userData.icon)

  let file = fs.readFileSync("./html/profile.html", {
    encoding: "utf8",
  });

  let data = await bookShema.find().sort({ name: 1 });

  let comments = data.filter((v) => {
    return v.chapters.map((e) => {
      return e?.comments?.username === userData.username;
    });
  });

  file = file.replaceAll("$$username$$", userData.username);
  file = file.replaceAll("$$avatar$$", userData.icon);
  file = file.replaceAll("$$followers$$", userData.followers);
  file = file.replaceAll("$$comments$$", comments.length);
  file = file.replace("$$discord$$", userData.discord || "#");
  file = file.replace("$$twitter$$", userData.twitter || "#");
  file = file.replace("$$date$$", userData.date);
  res.send(file);
});

app.post("/sign-up", upload.single("icon"), async (req, res) => {
  let html = req.body;
  console.log(html);
console.log(req.file)
  if (html.dp !== process.env.devPassword)
    return res.status(400).json({ error: `Incorrect password!` });

  if (!req.file)
    return res.status(400).json({ error: `Please upload an image.` });

  let image = req.file;
  //let buffer = fs.readFileSync(image.path);
  
  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  let data = await profileShema.find().sort({ username: 1 });

  if (data.find((v) => v.username === html.uname.replace(/</g, "&lt;")))
    return res.status(400).json({ error: `That username is already taken.` });

  let newProfile = new profileShema({
    username: html.uname.replace(/</g, "&lt;"),
    password: html.psw.replace(/</g, "&lt;"),
    icon: image.buffer,
    date: newdate,
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
    username: html.uname,
  });

  if (!data)
    return res
      .status(400)
      .json({ error: `Username or password is incorrect.` });

  if (data.password !== html.psw)
    return res
      .status(400)
      .json({ error: `Username or password is incorrect.` });

  return res.status(200).json({
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

  let params = {
    content: `New book has been submitted for review.`,
    embeds: [
      {
        title: html.name.replace(/</g, "&lt;"),
        description: html.description.replace(/</g, "&lt;"),
        image: { url: html.icon.replace(/</g, "&lt;") },
        footer: { text: newID },
      },
    ],
    username: "New Book Post",
  };
  await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(params),
    url: webhook_url,
  }).catch((err) => {
    console.log(err);
    return res.status(400).json({ error: `An error has occured.` });
  });

  let newReview = new reviewShema({
    bookName: html.name.replace(/</g, "&lt;"),
    bookAuthor: html.uname,
    bookDescription: html.description.replace(/</g, "&lt;"),
    bookIcon: html.icon.replace(/</g, "&lt;"),
    type: "book",
    reviewID: newID,
  }).save();

  res.status(200).json({
    success: `Successfully published for review! The Staff team will dm your results.`,
  });
});

app.post("/publish-chapter", async (req, res) => {
  let html = req.body.data;

  let data = await profileShema.findOne({
    password: html.psw,
    username: html.uname,
  });

  if (!data)
    return res.status(400).json({ error: `Incorrect username or password!` });

  let image = html.thumbnail.replace(/</g, "&lt;");

  function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  if (isImage(image) === false)
    return res
      .status(400)
      .json({ error: `Please make sure the icon is a valid URL.` });

  let content = html.content.replace(/</g, "&lt;");
  let newID = Date.now();

  let params = {
    content: `New chapter has been submitted for review.`,
    embeds: [
      {
        title: html.name,
        description: trim(content, 4095),
        image: { url: image },
        footer: { text: newID },
      },
    ],
    username: "New Chapter Post",
  };
  await axios({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: JSON.stringify(params),
    url: webhook_url,
  }).catch((err) => {
    console.log(err);
    return res.status(400).json({ error: `An error has occured.` });
  });

  let newReview = new reviewShema({
    bookName: html.name,
    bookAuthor: html.uname,
    bookDescription: content,
    bookIcon: image,
    type: "chapter",
    cType: html.type,
    cIntro: html.intro.replace(/</g, "&lt;"),
    cName: html.cname.replace(/</g, "&lt;"),
    cCredits: html.credits.replace(/</g, "&lt;"),
    reviewID: newID,
  }).save();

  res.status(200).json({
    success: `Successfully published for review! The Staff team will dm your results.`,
  });
});

app.post("/edit", async (req, res) => {
  let html = req.body.data;

  let data = await profileShema.findOne({
    password: html.psw,
    username: html.uname,
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
  let user = await profileShema.findOne({
    password: html.psw,
    username: html.uname,
  });
  if (!user)
    return res.status(400).json({ error: `Incorrect username or password!` });

  if (user.username === html.follow)
    return res.status(400).json({ error: `You cannot follow yourself!` });

  let user2 = await profileShema.findOne({ username: html.follow });

  if (user.following.includes(html.follow)) {
    let index = user.following.findIndex((v) => v === html.follow);
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

app.post("/follow-book", async (req, res) => {
  let html = req.body;
  let user = await profileShema.findOne({
    password: html.psw,
    username: html.uname,
  });
  if (!user)
    return res.status(400).json({ error: `Incorrect username or password!` });

  let book = await bookShema.findOne({ name: html.follow });

  if (book.following.includes(user.username)) {
    let index = book.following.findIndex((v) => v === user.username);
    book.following.splice(index, 1);
    book.save();
    return res
      .status(200)
      .json({ success: `Successfully unfollowed ${html.follow}!` });
  } else {
    book.following.push(user.username);
    book.save();
    return res
      .status(200)
      .json({ success: `Successfully followed ${html.follow}!` });
  }
});

app.post("/comment", async (req, res) => {
  let html = req.body.data; //book, chapter, uname, psw, comment
  let bookData = await bookShema.findOne({ name: html.book });

  if (!bookData)
    return res.status(400).json({ error: `Something went wrong.` });

  let user = await profileShema.findOne({
    password: html.psw,
    username: html.uname,
  });

  if (!user)
    return res.status(400).json({ error: `Incorrect username or password!` });

  let chapterIndex = bookData.chapters.findIndex(
    (v) => v.name === html.chapter
  );

  if (chapterIndex === -1)
    return res.status(400).json({ error: `Something went wrong.` });

  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  bookData.chapters[chapterIndex].comments.push({
    comment: html.comment.replace(/</g, "&lt;"),
    username: user.username,
    date: newdate,
  });

  bookData.markModified("chapters");
  await bookData.save();

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

function trim(str, max) {
  return str.length > max ? `${str.slice(0, max - 3)}...` : str;
}
