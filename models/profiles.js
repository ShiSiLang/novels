const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
  username: String,
  id: String,
  avatar: String,
  banner: String,
  bio: String,
  date: String,
  followers: Number,
  following: Array,
  discord: String,
  twitter: String,
  author: Boolean,
  books: Array,
  email: String,
});

module.exports = mongoose.model("profileSchema", profileSchema);
