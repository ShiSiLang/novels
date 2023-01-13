const mongoose = require("mongoose");

const comment = mongoose.Schema({
  password: { type: String, required: true },
  comments: Array,
});

module.exports = mongoose.model("website", comment);
