import { Anthropic } from "npm:@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: Deno.env.get("CLAUDE_API_KEY"),
});

export const handler = async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { projekt, budget, kategorie } = await req.json();

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Erstelle professionelles Angebot für ${kategorie}:\n\nProjekt: ${projekt}\nBudget: €${budget}\n\nFormat: Markdown, Titel, Leistungen, €75-95/h, 20-30% Material, Gesamtpreis, 2 Wochen gültig.`,
        },
      ],
    });

    return new Response(
      JSON.stringify({
        success: true,
        angebot: message.content[0].type === "text" ? message.content[0].text : "",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
