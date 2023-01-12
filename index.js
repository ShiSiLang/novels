const express = require("express");
const novel = require("./starOfLibby");
const comments = require("./comments");
const app = express();
const fs = require("fs");
const axios = require("axios");

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
app.get("/novel/:chapter", (req, res) => {
  let chapter = Number(req.params.chapter);
  //let commentsArray = JSON.parse(comments).comments;
  //let newObj = {
   // comments: commentsArray.filter((v) => v.chapter === chapter),
   // ...novel[chapter],
 // };
  //res.send(<script>alert(newObj);</script>);
  res.send(comments);
  //res.send(novel[chapter]);
});
app.get("/discord", (_, res) => res.redirect("https://discord.gg/j3YamACwPu"));

function write(data) {
  let out = JSON.parse(fs.readFileSync("comments.json", "utf8"));
  out.comments.push(data);
  fs.writeFileSync("comments.json", JSON.stringify(out));
}

app.post("/comment", async (req, res) => {
  let html = req.body;
  let profileArray = JSON.parse(process.env["profiles"]).profiles;
  let user = profileArray.find(
    (v) => v.password === html.psw.replace(/</g, "&lt;")
  );
  if (!user)
    return res.send(
      `Incorrect password!<script>setTimeout(function(){window.location="/read/1";},3000);</script>`
    );

  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  write({
    chapter: html.chapter.replace(/</g, "&lt;"),
    comment: html.comment.replace(/</g, "&lt;"),
    username: user.username,
    icon: user.icon,
    date: newdate,
  });
});

app.use((_, res) => res.status(404).sendFile(dir("error")));

app.listen(process.env.PORT || 80, () => {
  console.log("Server Started");
});

console.log(__dirname);

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
