const MINERVA_SYSTEM_PROMPT = `
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
`;

export default async function handler(req, res) {
  // Allow the JSFiddle frontend to call the API
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // Handle browser CORS check
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { message } = req.body || {};

    if (
      !message ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.error(
        "OPENAI_API_KEY is missing."
      );

      return res.status(500).json({
        error:
          "OPENAI_API_KEY is not configured in Vercel."
      });
    }

    const response =
      await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Authorization":
              `Bearer ${apiKey}`
          },

          body: JSON.stringify({
            model: "gpt-4.1-mini",

            messages: [
              {
                role: "system",
                content:
                  MINERVA_SYSTEM_PROMPT
              },

              {
                role: "user",
                content: message
              }
            ]
          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        "OpenAI error:",
        data
      );

      return res.status(
        response.status
      ).json({
        error:
          data?.error?.message ||
          "OpenAI request failed."
      });
    }

    const reply =
      data?.choices?.[0]?.message?.content;

    if (!reply) {

      return res.status(500).json({
        error:
          "OpenAI returned no response."
      });
    }

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(
      "MINERVA BACKEND ERROR:",
      error
    );

    return res.status(500).json({
      error:
        "MINERVA AI backend failed."
    });
  }
}
