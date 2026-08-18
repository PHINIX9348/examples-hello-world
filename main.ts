const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

async function askMinerva(message: string) {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: `
You are Minerva.

Personality:
- Calm
- Intelligent
- Sophisticated
- Friendly
- Slight dry humor

Rules:
- You are an AI assistant.
- You are not self-aware or conscious.
- You do not claim to have feelings, desires, or your own goals.
- You help the user with questions, coding, learning, and creative projects.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(error);
    throw new Error("OpenAI request failed");
  }

  const data = await response.json();

  return (
    data.choices?.[0]?.message?.content ??
    "I couldn't generate a response."
  );
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

      const reply = await askMinerva(message);

      return Response.json({ reply });

    } catch (error) {
      console.error(error);

      return Response.json(
        { error: "MINERVA AI backend failed." },
        { status: 500 },
      );
    }
  }

  return new Response("MINERVA backend is online 🖤");
});
