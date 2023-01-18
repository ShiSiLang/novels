const express = require("express");
const novel = require("./starOfLibby");
const comments = require("./models/comments");
const app = express();
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");

const dir = (text) => `${__dirname}/html/${text}.html`;
const link = (input) => `https://novels-production.up.railway.app/${input}`;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (_, res) => res.redirect(link("home")));
app.get("/home", async (_, res) => {
  const fetched = await axios.get(
    `https://api.countapi.xyz/hit/star-of-libby.shinpitekita.repl.co/${process.env.count}`
  );
  let file = fs.readFileSync("./html/home.html", {
    encoding: "utf8",
  });
  file = file.replace("$$visits$$", `${fetched.data.value}`);
  res.send(file);
});
app.get("/fan", (_, res) => res.sendFile(dir("fan")));
app.get("/sign-in", (_, res) => res.sendFile(dir("sign-in")));
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
  file = file.replace(
    "$$thumbnail$$",
    novel[chapter - 1]?.thumbnail || "https://i.imgur.com/lGLKiVd.png"
  );
  res.send(file);
});

app.get("/novel/:chapter", async (req, res) => {
  let chapter = Number(req.params.chapter);
  let db = await comments.findOne({ password: "ShinpiIsCool" });
  let newObj = {
    comments: db.comments.filter((v) => v.chapter === chapter + 1),
    ...novel[chapter],
  };
  res.send(newObj);
});

app.get("/discord", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

app.post("/sign-in", async (req, res) => {
  let html = req.body;
  if (html.dp !== process.env.profiles)
    return res.send(
      `Incorrect password!<script>setTimeout(function(){window.location="/home";},3000);</script>`
    );
  let image = html.icon.replace(/</g, "&lt;");

  function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  if (isImage(image) === false)
    return res.send("Please make sure the icon is a valid URL.");
/*
  await comments.findOneAndUpdate(
    { password: "ShinpiIsCool" },
    {
      $push: {
        profiles: {
          username: html.uname.replace(/</g, "&lt;"),
          icon: html.icon.replace(/</g, "&lt;"),
          password: html.psw.replace(/</g, "&lt;"),
        },
      },
    }
  );
  */
  return res.send("Coming Soon");
});

app.post("/comment", async (req, res) => {
  let html = req.body;
  let profileArray = await comments.findOne({ password: "ShinpiIsCool" });
  let user = profileArray.profiles.find(
    (v) =>
      v.password === html.psw.replace(/</g, "&lt;") &&
      v.username === html.uname.replace(/</g, "&lt;")
  );
  if (!user)
    return res.send(
      `Incorrect username or password!<script>setTimeout(function(){window.location="/read/1";},3000);</script>`
    );

  function isWhole(n) {
    return /^\d+$/.test(n);
  }

  let chapter = html.chapter.replace(/</g, "&lt;");

  if (!isWhole(chapter) || !novel[Number(chapter)])
    return res.send(
      `Not a valid chapter!<script>setTimeout(function(){window.location="/read/${Number(
        chapter
      )}";},3000);</script>`
    );

  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  await comments.findOneAndUpdate(
    {
      password: "ShinpiIsCool",
    },
    {
      $push: {
        comments: {
          chapter: Number(chapter),
          comment: `${html.comment.replace(/</g, "&lt;")}`,
          username: `${user.username}`,
          icon: `${user.icon}`,
          date: `${newdate}`,
        },
      },
    }
  );

  res.send(
    `Comment sent to chapter ${html.chapter.replace(
      /</g,
      "&lt;"
    )}<script>setTimeout(function(){window.location="/read/${Number(
      chapter
    )}";},3000);</script>`
  );
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
