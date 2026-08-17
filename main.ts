const API_KEY = Deno.env.get("GEMINI_API_KEY");

async function askGemini(message: string) {
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": API_KEY!,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(error);
    throw new Error("Gemini request failed");
  }

  const data = await response.json();

  return data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "I couldn't generate a response.";
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname === "/api/chat" && req.method === "POST") {
    try {
      const body = await req.json();

      const message = body.message;

      if (!message || typeof message !== "string") {
        return Response.json(
          { error: "Message is required." },
          { status: 400 },
        );
      }

      const reply = await askGemini(message);

      return Response.json({ reply });
    } catch (error) {
      console.error(error);

      return Response.json(
        { error: "AI backend failed." },
        { status: 500 },
      );
    }
  }

  return new Response("MINERVA backend is online.");
});
