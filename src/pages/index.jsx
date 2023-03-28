import { useState } from "react";

export default function Homepage() {
  const [url, setUrl] = useState("");
  const [info, setInfo] = useState({
    location: undefined,
    text: "",
  });
  const { location, text } = info;

  async function scan() {
    const response = await fetch(`/api/scan?url=${encodeURIComponent(url)}`);
    const data = await response.json();
    setInfo(data);
  }

  return (
    <div className="mt-16 container mx-auto flex items-center justify-center">
      <div className="border rounded-xl p-5 border-gray-400 bg-gray-200 text-gray-900 flex flex-col gap-2">
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
            Scan
          </button>
        </div>
        {info.text}
      </div>
    </div>
  );
}
