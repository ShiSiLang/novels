let webhook_url = process.env.webhook;

module.exports = {
  name: "upload-book",
  upload: "icon",
  run: async (req, res) => {
    return res.status(400).json({ error: `System currently down!` });

    let html = req.body;

    if (!req.file)
      return res.status(400).json({ error: `Please upload an icon.` });

    let icon = req.file.buffer;

    let data = await profileShema.findOne({
      password: html.psw,
      username: html.uname,
    });

    if (!data)
      return res.status(400).json({ error: `Incorrect username or password!` });


    if (isImage(image) === false)
      return res
        .status(400)
        .json({ error: `Please make sure the icon is a valid URL.` });

    let newID = Date.now();

    let params = {
      content: `New book has been submitted for review.`,
      embeds: [
        {
          title: html.name.replace(/</g, "&lt;"),
          description: html.description.replace(/</g, "&lt;"),
          image: { url: html.icon.replace(/</g, "&lt;") },
          footer: { text: newID },
        },
      ],
      username: "New Book Post",
    };
    await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(params),
      url: webhook_url,
    }).catch((err) => {
      console.log(err);
      return res.status(400).json({ error: `An error has occured.` });
    });

    let newReview = new reviewShema({
      bookName: html.name.replace(/</g, "&lt;"),
      bookAuthor: html.uname,
      bookDescription: html.description.replace(/</g, "&lt;"),
      bookIcon: html.icon.replace(/</g, "&lt;"),
      type: "book",
      reviewID: newID,
    }).save();

    res.status(200).json({
      success: `Successfully published for review! The Staff team will dm your results.`,
    });
  },
};
