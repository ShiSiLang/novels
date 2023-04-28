const profileShema = require("../models/profiles");
const reviewShema = require("../models/review");

module.exports = {
  name: "upload-manga",
  fields: [{ name: "thumbnail", maxCount: 1 }, { name: "pages" }],
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let userObject = JSON.parse(html.user);

    let user = await profileShema.findOne({
      username: userObject.username,
      id: userObject.id,
      email: userObject.email,
      password: userObject.password,
    });

    if (!user)
      return res.status(400).json({ error: `Could not fetch user data.` });

    if (user.author !== true)
      return res
        .status(400)
        .json({ error: `Your profile does not have author perms!` });

    try {
      // Access form data and uploaded files from req.body and req.files objects respectively
      console.log(req.body);
      const bookName = req.body.bookName;
      const chapterType = req.body.type;
      const chapterName = req.body.chapterName;
      const isReplace = req.body.replace === "on";
      const replaceNumber = req.body.replaceNumber || null;
      const thumbnailPath = req.files.thumbnail[0].buffer;
      const pagesPaths = req.files.pages.map((file) => file.buffer);
      console.log(thumbnailPath);
      console.log(pagesPaths);

      // Save the paths to the database and update the book object with the new chapter information
      // ...
    } catch (error) {
      // Handle errors
    }
  },
};
