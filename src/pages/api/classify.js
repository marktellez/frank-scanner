async function classifyText(text) {
  const response = await fetch(
    `https://api.uclassify.com/v1/waterside/Waterside_Taxonomy_v1_0/classify`,
    {
      method: "POST",
      cors: "no-cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.UCLASSIFY_READ_KEY}`,
      },
      body: JSON.stringify({ texts: [text] }),
    }
  );

  return await response.json();
}

export default async function classify(req, res) {
  const { text } = JSON.parse(req.body);

  try {
    const result = await classifyText(text);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
