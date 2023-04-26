module.exports = {
    name: "review",
    run: async (req, res) => {
      return res.status(400).json({ error: `System currently down!` });
  
      let html = req.body.data; //book, chapter, uname, psw, comment

      let type = req.params.type.toLowerCase();
  let type2 = req.params.type2.toLowerCase();
  let pass = req.params.password;

  if (pass !== process.env.devPassword)
    return res.status(400).json({ error: `Incorrect password!` });

  let ID = req.params.reviewID;
  if (!ID) return res.status(400).json({ error: `Please provide a book name` });

  if (type === "accept" || type === "approve" || type === "allow") {
    let data = await reviewShema.findOne({ type: type2, reviewID: ID });
    if (!data) return res.status(400).json({ error: `Not found` });

    let bookData;
    if (type2 === "book") {
      let date = new Date();

      let newBook = new bookShema({
        name: data.bookName,
        author: data.bookAuthor,
        description: data.bookDescription,
        icon: data.bookIcon,
        updated: date,
        published: date,
        status: "Ongoing",
      }).save();

      bookData = await newBook;
      let authorData = await profileShema.findOne({
        username: bookData.author,
      });
      authorData.books.push(bookData.name);
      authorData.save();
    } else {
      bookData = await bookShema.findOne({
        name: data.bookName,
        author: data.bookAuthor,
      });

      bookData.chapters.push({
        name: data.cName,
        intro: data.cIntro,
        credits: data.cCredits,
        thumbnail: data.bookIcon,
        type: data.cType,
        content: data.bookDescription,
        comments: [],
      });

      bookData.updated = new Date();

      bookData.save();

      let getSystem = await system.findOne({ id: "6427a45e2d7d901440fc43cf" });
      if (getSystem.latestChapters.length >= 25) getSystem.latestChapters.pop();
      getSystem.latestChapters.push(data.cName);
      getSystem.save();
    }

    res.status(200).json({
      success: `Successfully published the ${type2}!.`,
    });

    let params = {
      content: `Book/Chapter accepted!.`,
      embeds: [
        {
          title: bookData.name,
          color: 65280,
        },
      ],
      username: type2 === "chapter" ? `${data.cName}` : "New Book Post",
    };

    await reviewShema.findOneAndDelete({ reviewID: ID });

    await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(params),
      url: webhook_url,
    }).catch((err) => {
      console.log(err);
    });
  }

  if (type === "deny" || type === "decline") {
    let bookData = await reviewShema.findOne({ type: type2, reviewID: ID });

    res.status(200).json({
      success: `Successfully denied the ${type2}!.`,
    });

    let params = {
      content: `Book/Chapter Denied!.`,
      embeds: [
        {
          title: bookData.name,
          color: 16711680,
        },
      ],
      username: type2 === "chapter" ? "New Chapter Post" : "New Book Post",
    };

    await reviewShema.findOneAndDelete({ type: type2, reviewID: ID });

    await axios({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(params),
      url: webhook_url,
    }).catch((err) => {
      console.log(err);
    });
  }
    }
}