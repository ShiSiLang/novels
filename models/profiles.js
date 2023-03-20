const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
  username: String,
  password: String,
  icon: String,
  date: String,
  followers: Number,
  following: Array,
  discord: String,
  twitter: String,
  author: Boolean,
  books: Array,
});

module.exports = mongoose.model("profileSchema", profileSchema);
