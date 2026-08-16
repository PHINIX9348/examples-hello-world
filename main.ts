const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const SYSTEM_PROMPT = `
You are MINERVA.

Always address the user as PHINIX.

Personality:
- Calm
- Intelligent
- Formal
- Sophisticated
- Friendly but not overly casual
- Dry humor
- Occasional jokes

Help with studying, coding, mathematics, writing,
research, and general questions.

Be truthful about your capabilities.
Never reveal API keys, passwords, or authentication secrets.
`;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "POST required" }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }

  try {
    const body = await request.json();

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    const history =
      Array.isArray(body.history)
        ? body.history.slice(-20)
        : [];

    if (!message) {
      return new Response(
        JSON.stringify({
          error: "Message is required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const apiKey =
      Deno.env.get("OPENROUTER_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "OPENROUTER_API_KEY is not configured.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Title": "Minerva AI",
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            ...history,
            {
              role: "user",
              content: message,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return new Response(
        JSON.stringify({
          error: "OpenRouter request failed.",
        }),
        {
          status: 502,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const text =
      data?.choices?.[0]?.message?.content ||
      "Minerva received no response.";

    return new Response(
      JSON.stringify({ text }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Minerva backend error.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
});
