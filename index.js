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
app.get("/sign-up", (_, res) => res.sendFile(dir("sign-up")));

app.get("/explore", async (req, res) => {
  res.sendFile(dir("explore"));
});

/*
Book Data:
Name
Desc
Author
chapters: Array
*/

app.get("/explore/:book", async (req, res) => {
  /*
  if(!foundBook)return res.sendFile(dir("error"))
  */
  let file = fs.readFileSync("./html/book.html", {
    encoding: "utf8",
  });
  file = file.replaceAll("$$name$$", `Star of Libby, Adiós Hogar Mío`);
  file = file.replaceAll("$$desc$$", `What happens when a tiger owns a gang?`);
  file = file.replaceAll("$$author$$", `Lonely Ball`);
  file = file.replaceAll("$$novel$$", "'https://novels-production.up.railway.app/data/novel'");

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

app.post("/sign-up", async (req, res) => {
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
    return res.send(
      `Please make sure the icon is a valid URL.<script>setTimeout(function(){window.location="/home";},3000);</script>`
    );

  let date = new Date();
  let newdate =
    date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();

  await comments.findOneAndUpdate(
    { password: "ShinpiIsCool" },
    {
      $push: {
        profiles: {
          username: html.uname.replace(/</g, "&lt;"),
          icon: image,
          password: html.psw.replace(/</g, "&lt;"),
          date: `${newdate}`,
          followers: 0,
          following: [],
          discord: null,
          twitter: null,
        },
      },
    }
  );
  return res.send(
    `${html.uname.replace(
      /</g,
      "&lt;"
    )} added!<script>setTimeout(function(){window.location="/sign-in";},3000);</script>`
  );
});

app.get("/data/:name", async (req, res) => {
  let type = req.params.name.toLowerCase();

  if (type === "profiles") {
    let db = await comments.findOne({ password: "ShinpiIsCool" });
    let newObj = db.profiles.map((v) => v.username);
    res.send(newObj);
  }
  if (type === "novel") {
    res.send(novel);
  }
});

app.get("/profile/:username", async (req, res) => {
  let username = req.params.username.toLowerCase();
  let db = await comments.findOne({ password: "ShinpiIsCool" });
  let user = db.profiles.find(
    (v) => v.username.toLowerCase() === username.replace(/</g, "&lt;")
  );
  if (!user)
    return res.send(
      `Account not found, try again!<script>setTimeout(function(){window.location="/profile/shinpi";},3000);</script>`
    );
  let file = fs.readFileSync("./html/profile.html", {
    encoding: "utf8",
  });
  file = file.replaceAll("$$username$$", user.username);
  file = file.replaceAll("$$avatar$$", user.icon);
  file = file.replaceAll("$$followers$$", user?.followers || 0);
  file = file.replaceAll(
    "$$comments$$",
    db.comments?.filter((v) => v.username === user.username).length || 0
  );
  file = file.replace("$$discord$$", user?.discord || "#");
  file = file.replace("$$twitter$$", user?.twitter || "#");
  file = file.replaceAll("$$avatar$$", user.icon);
  file = file.replace("$$date$$", user?.date || "1/13/2023");
  file = file.replace(
    "$$profiles$$",
    `'https://novels-production.up.railway.app/data/profiles'`
  );
  res.send(file);
});

app.post("/edit", async (req, res) => {
  let html = req.body;
  let profileArray = await comments.findOne({ password: "ShinpiIsCool" });
  let user = profileArray.profiles.find(
    (v) =>
      v.password === html.psw.replace(/</g, "&lt;") &&
      v.username === html.uname.replace(/</g, "&lt;")
  );
  if (!user)
    return res.send(
      `Incorrect username or password!<script>setTimeout(function(){window.location="/profile/shinpi";},3000);</script>`
    );

  let params = {
    username: user.username,
    password: user.password,
    icon: html?.newicon || user.icon,
    date: user?.date || "1/13/2023",
    followers: user?.followers || 0,
    following: user?.following || [],
    discord: html?.discord || user?.discord || null,
    twitter: html?.twitter || user?.twitter || null,
  };

  function isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  }

  if (isImage(params.icon) === false)
    return res.send(
      `Please make sure the icon is a valid URL.<script>setTimeout(function(){window.location="/profile/${user.username}";},4000);</script>`
    );

  function isDiscord(url) {
    return /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/.test(
      url
    );
  }

  if (params.discord !== null && isDiscord(params.discord) === false)
    return res.send(
      `Please make sure the discord link is a valid URL.<script>setTimeout(function(){window.location="/profile/${user.username}";},4000);</script>`
    );

  function isTwitter(url) {
    return /http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/.test(url);
  }

  if (params.twitter !== null && isTwitter(params.twitter) === false)
    return res.send(
      `Please make sure the twitter link is a valid URL.<script>setTimeout(function(){window.location="/profile/${user.username}";},4000);</script>`
    );

  let objIndex = profileArray.profiles.findIndex(
    (v) =>
      v.password === html.psw.replace(/</g, "&lt;") &&
      v.username === html.uname.replace(/</g, "&lt;")
  );

  profileArray.profiles[objIndex] = params;

  await comments.findOneAndUpdate(
    {
      password: "ShinpiIsCool",
    },
    profileArray
  );

  res.send(
    `Profile successfully edited.<script>setTimeout(function(){window.location="/profile/${user.username}";},4000);</script>`
  );
});

app.post("/follow", async (req, res) => {
  let html = req.body;
  let profileArray = await comments.findOne({ password: "ShinpiIsCool" });
  let user = profileArray.profiles.find(
    (v) =>
      v.password === html.psw.replace(/</g, "&lt;") &&
      v.username === html.uname.replace(/</g, "&lt;")
  );
  if (!user)
    return res.send(
      `Incorrect username or password!<script>setTimeout(function(){window.location="/profile/shinpi";},3000);</script>`
    );

  if (html.uname === html.follow)
    return res.send(
      `You cannot follow yourself!<script>setTimeout(function(){window.location="/profile/${user.username}";},3000);</script>`
    );

  let user2 = profileArray.profiles.find((v) => v.username === html.follow);

  if (user.following.includes(html.follow)) {
    let objIndex = profileArray.profiles.findIndex(
      (v) =>
        v.password === html.psw.replace(/</g, "&lt;") &&
        v.username === html.uname.replace(/</g, "&lt;")
    );
    let objIndex2 = profileArray.profiles.findIndex(
      (v) => v.username === html.follow
    );

    if (objIndex > -1 && objIndex2 > -1) {
      profileArray.profiles[objIndex].following.splice(index, 1);
      profileArray.profiles[objIndex2].followers -= 1;
      await comments.findOneAndUpdate(
        {
          password: "ShinpiIsCool",
        },
        profileArray
      );
      res.send(
        `Successfully unfollowed ${html.follow}!<script>setTimeout(function(){window.location="/profile/${user2.username}";},3000);</script>`
      );
    }
  } else {
    let objIndex = profileArray.profiles.findIndex(
      (v) =>
        v.password === html.psw.replace(/</g, "&lt;") &&
        v.username === html.uname.replace(/</g, "&lt;")
    );
    let objIndex2 = profileArray.profiles.findIndex(
      (v) => v.username === html.follow
    );

    if (objIndex > -1 && objIndex2 > -1) {
      profileArray.profiles[objIndex].following.push(html.follow);
      profileArray.profiles[objIndex2].followers += 1;
      await comments.findOneAndUpdate(
        {
          password: "ShinpiIsCool",
        },
        profileArray
      );
      res.send(
        `Successfully followed ${html.follow}!<script>setTimeout(function(){window.location="/profile/${user2.username}";},3000);</script>`
      );
    }
  }
});

app.post("/comment", async (req, res) => {
  let html = req.body.data;
  console.log(html)
  let profileArray = await comments.findOne({ password: "ShinpiIsCool" });
  let user = profileArray.profiles.find(
    (v) =>
      v.password === html.psw.replace(/</g, "&lt;") &&
      v.username === html.uname.replace(/</g, "&lt;")
  );
  if (!user) return res.status(400).json({ error: `Incorrect username or password!` });

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
          chapter: Number(html.chapter),
          comment: `${html.comment.replace(/</g, "&lt;")}`,
          username: `${user.username}`,
          icon: `${user.icon}`,
          date: `${newdate}`,
        },
      },
    }
  );

  return res.status(200).json({ success: `Comment sent to chapter ${html.chapter}` });
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
