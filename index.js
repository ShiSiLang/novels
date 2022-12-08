const express = require("express");
var cors = require('cors');
const novel = require('./starOfLibby');
const app = express();
const fs = require('fs');
const axios = require('axios');

const dir = (text) => `${__dirname}/html/${text}.html`;
const link = (input) => `https://Star-of-Libby.shinpitekita.repl.co/${input}`;

app.use(cors())
app.use(express.urlencoded())
app.get('/', (_, res) => res.redirect(link('home')));
app.get('/home', async (_, res) => {
    const fetched = await axios.get(`https://api.countapi.xyz/hit/star-of-libby.shinpitekita.repl.co/${process.env.count}`);
  let file = fs.readFileSync("./html/home.html", {
		encoding: "utf8"
	})
  file = file.replace("$$visits$$", `${fetched.data.value}`)
  res.send(file)
})
app.get('/read/:chapter', async (req, res) => {
  let chapter = Number(req.params.chapter) || 1;
  let file = fs.readFileSync("./html/sol.html", {
		encoding: "utf8"
	})
  file = file.replace("$$change$$", `'https://star-of-libby.shinpitekita.repl.co/novel/${Number(chapter) - 1}'`)
  file = file.replace("$$change2$$", `${Number(chapter) + 1}`)
  file = file.replace("$$change3$$", `${Number(chapter) - 1}`)
  file = file.replace("$$change4$$", novel[chapter - 1]?.chapter || "Chapter Not Found.")
  res.send(file)
})
app.get('/novel/:chapter', (req, res) => {
  let chapter = Number(req.params.chapter) 
	res.send(novel[chapter]);
});
app.get('/discord', (_, res) => res.redirect('https://discord.gg/j3YamACwPu'));

app.use((_, res) => res.status(404).sendFile(dir('error')));

app.listen(5000, () => {
	console.log("Website is up!")
})

console.log(__dirname)

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
