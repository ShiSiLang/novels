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

app.get("/read/:bookName/:chapter", async (req, res) => {
  
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
