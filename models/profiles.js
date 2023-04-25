const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
  username: String,
  password: String,
  icon: { type: String, required: true },
  banner: String,
  bio: String,
  date: String,
  followers: Number,
  following: Array,
  discord: String,
  twitter: String,
  author: Boolean,
  books: Array,
// Login data
  login: {
    email: {
      type: String,
      required: true,
      unique: true
    },
    passwordHash: {
      type: String,
      required: true
    }
  }
});

module.exports = mongoose.model("profileSchema", profileSchema);
