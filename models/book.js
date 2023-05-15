const mongoose = require("mongoose");

const bookSchema = mongoose.Schema(
  {
    name: String,
    description: String,
    icon: String,
    author: String,
    chapters: [
      {
        name: String,
        intro: String,
        credits: String,
        thumbnail: String,
        type: String, //Novel/Manga/Webtoon
        images: Array, // Array of image strings data for manga/webtoon
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
    ],
    followers: Array, // Array of ids
    tags: Array,
    updated: String,
    status: String,
    published: String,
    views: { type: Number, default: 0 },
  },
  { typeKey: "$type" }
);

module.exports = mongoose.model("book", bookSchema);
