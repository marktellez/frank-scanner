import cheerio from "cheerio";

const nonPages = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "bmp",
  "svg",
  "webp",
  "ico",
  "mp3",
  "wav",
  "ogg",
  "mp4",
  "webm",
  "flv",
  "avi",
  "mov",
  "wmv",
  "mkv",
  "js",
];

export default async function handler(req, res) {
  function ensureAbsolute(url) {
    return url.startsWith("http") ? url : `https://${url}`;
  }

  function findInternalLinks(html, url) {
    const host = new URL(url).host;
    const $ = cheerio.load(html);
    const links = $("a")
      .map((i, el) => $(el).attr("href"))
      .get()
      .filter(
        (href) =>
          href &&
          href.includes(host) &&
          !nonPages.includes(href.split(".")[1]) &&
          !href.includes("mailto")
      );

    return pickTopLinks(links, 5);
  }

  function pickTopLinks(links, count) {
    return links.slice(0, count);
  }

  async function collectPageText(links) {
    const textPromises = links.map(async (link) => {
      console.dir(`requesting ${link}`);
      const response = await fetch(link);
      const html = await response.text();
      const $ = cheerio.load(html);
      return $("body").text();
    });

    const texts = await Promise.all(textPromises);
    return texts.join(" ");
  }

  const { url } = req.query;

  const baseUrl = ensureAbsolute(url);
  const response = await fetch(baseUrl);
  const html = await response.text();
  const links = findInternalLinks(html, baseUrl);
  const text = await collectPageText(
    links.map((link) =>
      link.includes(baseUrl.replace(/https?:\/\//, "")) ? link : baseUrl + link
    )
  );

  res.status(200).json({ text: text.replace(/\\n/, "").replace(/\\t/, "") });
}
