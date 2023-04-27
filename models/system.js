const mongoose = require("mongoose");

const system = mongoose.Schema({
  registeredBots: Array,
  latestChapters: Array,
  readingNow: Array,
});

module.exports = mongoose.model("system", system);
