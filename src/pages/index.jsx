import { useState, useEffect } from "react";

export default function Homepage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  const [statusUrl, setStatusUrl] = useState(undefined);
  const [classifierData, setClassifierData] = useState({});
  const [text, setText] = useState("");

  async function classify(text) {
    const res = await fetch("/api/classify", {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    return await res.json();
  }

  async function scan() {
    setBusy(true);
    setText("");
    setError("");

    const response = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);

    const { statusUrl } = await response.json();
    setStatusUrl(statusUrl);
  }

  useEffect(() => {
    if (!statusUrl) return;
    pollStatus();
  }, [statusUrl]);

  async function pollStatus() {
    try {
      console.dir("polling");
      const res = await fetch(
        "/api/status?statusUrl=" + encodeURIComponent(statusUrl)
      );

      const data = await res.json();

      if (data.error) return setError(error);

      if (data.status === "finished" && data.response.body) {
        setBusy(false);
        setStatusUrl(undefined);
        const titleMatch = data.response.body.match(/\<title\>(.*)\<\/title\>/);
        const descMatch = data.response.body.match(
          /<meta\s+name="description"\s+content="(.*?)"/
        );

        const body = new DOMParser().parseFromString(
          data.response.body,
          "text/html"
        ).body.textContent;

        const combined =
          (titleMatch ? titleMatch[1] : "") +
          (descMatch ? descMatch[1] : "") +
          body;

        const stopWords = [
          "a",
          "an",
          "and",
          "are",
          "as",
          "at",
          "be",
          "but",
          "by",
          "for",
          "if",
          "in",
          "into",
          "is",
          "it",
          "no",
          "not",
          "of",
          "on",
          "or",
          "such",
          "that",
          "the",
          "their",
          "then",
          "there",
          "these",
          "they",
          "this",
          "to",
          "was",
          "will",
          "with",
          "cdata",
          "var",
          "true",
          "false",
          "rgb",
          "rgba",
          "px",
          "h",
          "jquery",
          "document",
          "window",
          "new",
          "date",
          "function",
          "var",
          "return",
          "typeof",
          "undefined",
          "rem",
          "em",
          "load",
          "i",
          "body",
          "auto",
          "gettime",
          "maxwidth",
          "minwidth",
        ];

        setText(
          combined
            .replace(/[^a-zA-Z ]/g, "")
            .split(" ")
            .filter(
              (word) =>
                word.trim().length > 3 &&
                word.length < 10 &&
                !stopWords.includes(word.toLowerCase())
            )
            .join(" ")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim()
        );

        const classification = await classify(combined);
        setClassifierData(classification);
      } else {
        setTimeout(pollStatus, 1000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="mt-16 container mx-auto flex items-center justify-center flex flex-col gap-2">
      <div className="border rounded-xl p-5 border-gray-400 bg-gray-200 text-gray-900 ">
        <div>
          <div className="text-xl">Enter a url to scan</div>
          <input
            disabled={busy}
            className="outline-none py-1 px-2 text-center text-sm text-gray-700"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={scan}
            className="bg-pink-500 text-white font-semibold shadow-md rounded py-1 px-5 flex items-center justify-center w-full text-sm">
            {busy ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20">
                  <circle
                    className="opacity-25"
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 10a6 6 0 0 1 12 0c0 3.31-2.69 6-6 6s-6-2.69-6-6"></path>
                </svg>{" "}
                working...
              </>
            ) : (
              <>Scan</>
            )}
          </button>
        </div>
      </div>
      {error ? <div>{error}</div> : ""}
      {!busy && classifierData[0]?.classification ? (
        <>
          <h2>Classification</h2>
          <textarea className="w-full min-h-[300px] text-black">
            {JSON.stringify(
              classifierData[0].classification
                .map(({ className, p }) => ({
                  classification: className,
                  percent: parseInt(p * 100),
                }))
                .sort((a, b) => b.percent - a.percent)
                .slice(0, 3)
                .map(({ classification, percent }) => ({
                  [classification]: `${percent}%`,
                })),

              null,
              2
            )}
          </textarea>
        </>
      ) : (
        ""
      )}
      {!busy && text.length > 0 && (
        <>
          <h2>Text</h2>
          <textarea className="w-full min-h-[300px] text-black">
            {text}
          </textarea>
        </>
      )}
    </div>
  );
}
