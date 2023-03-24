const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  bookName: String,
  bookAuthor: String,
  bookDescription: String,
  bookIcon: String,
  reviewID: String,
});

module.exports = mongoose.model("review", reviewSchema);
