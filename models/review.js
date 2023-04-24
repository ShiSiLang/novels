const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  bookName: String,
  bookAuthor: String,
  bookDescription: String,
  bookIcon: String,
  type: String,
  cType: String,
  cIntro: String,
  cName: String,
  cCredits: String,
  reviewID: String,
  replace: Boolean,
  replaceNumber: Number,
});

module.exports = mongoose.model("review", reviewSchema);
