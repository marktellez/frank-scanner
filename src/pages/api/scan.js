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

  const { url } = req.query;

  const baseUrl = ensureAbsolute(url);
  const scraperApi = "https://async.scraperapi.com/jobs";
  const apiKey = process.env.SCRAPER_API_KEY;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      apiKey,
      url: baseUrl,
    }),
  };

  const response = await fetch(scraperApi, options);
  const { statusUrl } = await response.json();

  res.status(200).json({ statusUrl });
}
