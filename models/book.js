const mongoose = require("mongoose");
/* chapters: { 
    type: image/novel, 
    content: image/String, 
    comments: { username, comment, chapter, date } 
}*/
const bookSchema = mongoose.Schema({
  name: String,
  description: String,
  author: String,
  chapters: Array,
});

module.exports = mongoose.model("book", bookSchema);
