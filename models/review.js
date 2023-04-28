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
    replace: Boolean,
    replaceNumber: Number,
  },
  book: {
    name: String,
    description: String,
    tags: Array,
    icon: Buffer,
    author: String,
  },
});

module.exports = mongoose.model("review", reviewSchema);
