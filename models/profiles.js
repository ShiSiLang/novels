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
  books: Array,
  email: String,
  permissionsLevel: Number,
});

module.exports = mongoose.model("profileSchema", profileSchema);
