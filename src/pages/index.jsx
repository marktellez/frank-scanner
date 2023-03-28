import { useState } from "react";

const defaultInfo = {
  location: undefined,
  text: "",
};

export default function Homepage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState(defaultInfo);
  const { location, text } = info;

  async function scan() {
    setBusy(true);
    setInfo(defaultInfo);
    setError("");

    const response = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
    const data = await response.json();

    if (data.error) {
      setError(data.error);
      return;
    }

    setInfo(data);
    setBusy(false);
  }

  return (
    <div className="mt-16 container mx-auto flex items-center justify-center flex flex-col gap-2">
      <div className="border rounded-xl p-5 border-gray-400 bg-gray-200 text-gray-900 ">
        <div>
          <div className="text-xl">Enter a url to scan</div>
          <input
            className="outline-none py-1 px-2 text-center text-sm text-gray-700"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button
            onClick={scan}
            className="bg-pink-500 text-white font-semibold shadow-md rounded py-1 px-5 flex items-center justify-center w-full text-sm">
            {busy ? (
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
              </svg>
            ) : (
              <>Scan</>
            )}
          </button>
        </div>
      </div>
      {error ? <div>{error}</div> : ""}
      {info.text.length ? (
        <textarea
          value={info.text}
          className="w-full min-h-[200px] border border-gray-200 text-gray-800  rounded-xl"
        />
      ) : (
        ""
      )}
    </div>
  );
}
