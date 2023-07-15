const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    name: String,
    description: String,
    icon: String,
    author: String,
    type: String, //Novel/Manga/Webtoon
    chapters: [
      {
        name: String,
        intro: String,
        credits: String,
        thumbnail: String,
        images: Array, // Array of image strings data for manga/webtoon
        novel: String, // String for novels
        views: Number,
        comments: [
          {
            username: String,
            userID: String,
            comment: String,
            date: Date,
          },
        ],
      },
    ],
    followers: Array, // Array of ids
    tags: Array,
    updated: String,
    status: String,
    published: String,
  },
  { typeKey: "$type" }
);

module.exports = mongoose.model("book", bookSchema);
