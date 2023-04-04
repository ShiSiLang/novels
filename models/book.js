const mongoose = require("mongoose");
/* chapters: { 
    name: String,
    intro: String,
    credits: String,
    timer: String,
    thumbnail: ImageLink,
    type: manga/novel, 
    content: images/String, 
    comments: { username, comment, date } 
}*/
const bookSchema = mongoose.Schema({
  name: String,
  description: String,
  icon: String,
  author: String,
  chapters: Array,
  followers: Array, // It will only store usernames
  views: { type: Number, default: 0 },
});

module.exports = mongoose.model("book", bookSchema);
