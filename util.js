module.exports = {
  trim(str, max) {
    return str.length > max ? `${str.slice(0, max - 3)}...` : str;
  },
  emojiCharacters(component) {
    let characters = {
      a: "🇦",
      b: "🇧",
      c: "🇨",
      d: "🇩",
      e: "🇪",
      f: "🇫",
      g: "🇬",
      h: "🇭",
      i: "🇮",
      j: "🇯",
      k: "🇰",
      l: "🇱",
      m: "🇲",
      n: "🇳",
      o: "🇴",
      p: "🇵",
      q: "🇶",
      r: "🇷",
      s: "🇸",
      t: "🇹",
      u: "🇺",
      v: "🇻",
      w: "🇼",
      x: "🇽",
      y: "🇾",
      z: "🇿",
      0: "0⃣",
      1: "1⃣",
      2: "2️⃣",
      3: "3️⃣",
      4: "4️⃣",
      5: "5️⃣",
      6: "6️⃣",
      7: "7️⃣",
      8: "8️⃣",
      9: "9️⃣",
      10: "🔟",
      "#": "#⃣",
      "*": "*⃣",
      "!": "❗",
      "?": "❓",
    };
    if (Object.keys(characters).includes(`${component}`)) {
      let index = Object.keys(characters).findIndex(
        (element) => element === `${component}`
      );
      if (index === -1) {
        return "Character not found.";
      } else {
        return Object.values(characters)[index];
      }
    }
  },
  getTimeDifference(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval + " year" + (interval == 1 ? "" : "s") + " ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + " month" + (interval == 1 ? "" : "s") + " ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + " day" + (interval == 1 ? "" : "s") + " ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " hour" + (interval == 1 ? "" : "s") + " ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " minute" + (interval == 1 ? "" : "s") + " ago";
    }
    return "just now";
  },
  isWhole(n) {
    return /^\d+$/.test(n);
  },
  isImage(url) {
    return /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  },
  getBase64DataUrl(buffer) {
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  },
};
