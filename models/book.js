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
});

module.exports = mongoose.model("book", bookSchema);
