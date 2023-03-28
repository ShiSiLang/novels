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
  followers: Array,// It will only store usernames
  1: Number, //  the key is the weight of that star level
  2: Number,
  3: Number,
  4: Number,
  5: Number,
  default: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1 },
});

module.exports = mongoose.model("book", bookSchema);
