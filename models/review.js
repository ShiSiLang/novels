const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  type: String, //Book, Chapter
  reviewID: String,
  chapter: {
    name: String,
    intro: String,
    credits: String,
    thumbnail: Buffer,
    type: String, //Novel/Manga/Webtoon
    images: [Buffer], // Array of binary image data for manga/webtoon
    novel: String, // String for novels
    comments: [
      {
        username: String,
        userID: String,
        comment: String,
        date: Date,
      },
    ],
  },
  book: {
    name: String,
    description: String,
    icon: Buffer,
    author: String,
    updated: String,
    published: String,
    status: String,
  },
});

module.exports = mongoose.model("review", reviewSchema);
