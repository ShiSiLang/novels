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
  r1: Number, //  the key is the weight of that star level
  r2: Number,
  r3: Number,
  r4: Number,
  r5: Number,
  default: { r1: 1, r2: 1, r3: 1, r4: 1, r5: 1 },
});

module.exports = mongoose.model("book", bookSchema);
