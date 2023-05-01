const express = require("express");
const app = express();
const fs = require("fs");
const axios = require("axios");
const mongoose = require("mongoose");
const system = require("./models/system");
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

app.get("/tos", (_, res) => res.sendFile(dir("tos")));

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


TERMS OF SERVICE

1. Users are allowed to post their own original manga/novel content on the website.
2. Users retain full ownership and responsibility for their content.
3. Users must not upload content that violates any laws or infringes on any third-party rights.
4. Users must not upload content that contains graphic violence, hate speech, or nudity (except under strict restrictions).
5. The website reserves the right to remove any content that violates these terms or is otherwise deemed inappropriate.
6. The website reserves the right to modify these terms of service at any time without prior notice.
7. By using the website, users agree to abide by these terms of service.

COMMUNITY GUIDELINES

1. Users must respect the rights and opinions of others.
2. Users must not engage in hate speech, harassment, or personal attacks.
3. Users must not post spam, advertisements, or links to external websites.
4. Users must not disrupt the community or the website in any way.
5. Users must not engage in any illegal activities.
6. The website reserves the right to remove any content or user that violates these guidelines.
7. By using the website, users agree to abide by these community guidelines.

PRIVACY POLICY

1. The website only collects basic information from users who log in with Discord, including their Discord ID, username, email address, and banner.
2. The website does not collect any other personal information from users without their consent.
3. The website may use cookies to enhance the user experience.
4. The website will not sell or share any user information with third parties.
5. The website reserves the right to modify this privacy policy at any time without prior notice.

COMMENTING ON BOOKS GUIDELINES

1. Comments must be relevant and related to the content of the book.
2. Comments must not contain hate speech, harassment, or personal attacks on the author or other users.
3. Comments must not contain spam, advertisements, or links to external websites.
4. Users should avoid spoilers in their comments, or clearly label them as such.
5. Users should respect the opinions of others and engage in constructive discussion.
6. Users should not engage in any behavior that disrupts the community or the website.

By using the website, users agree to abide by these terms of service, community guidelines, privacy policy, and commenting on books guidelines.
