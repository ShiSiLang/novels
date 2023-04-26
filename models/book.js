const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  name: String,
  description: String,
  icon: Buffer,
  author: String,
  chapters: [
    {
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
  ],
  followers: Array, // Array of usernames
  updated: String,
  status: String,
  published: String,
  views: { type: Number, default: 0 },
});

module.exports = mongoose.model("book", bookSchema);
