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

app.post("/comment", async (req, res) => {
  let html = req.body;
  //await comments.findOneAndUpdate({ password: "ShinpiIsCool" },{
  //$push: {
  // profiles: { username: 'KeitaTheImposter', icon: 'https://cdn.discordapp.com/attachments/1053409619835367495/1055474750136262666/a26d916eb943ab4299877af816e0bb10.png', password: ''}
  //}
  // })
  //return res.send('Keita added');
  let profileArray = await comments.findOne({ password: "ShinpiIsCool" });
  return res.send(profileArray);
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
  /*
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
  */
  profileArray.comments = [
    {
      chapter: 1,
      comment: "",
      username: "Shinpi",
      icon: `https://i.imgur.com/lGLKiVd.png","date":"1/13/2023`,
      date: `1/13/2023`,
    },
  ];
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
