import { Anthropic } from "npm:@anthropic-ai/sdk";
import { define } from "../../utils.ts";

const client = new Anthropic({
  apiKey: Deno.env.get("CLAUDE_API_KEY"),
});

export const handler = define.handlers({
  async OPTIONS() {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
  async POST(ctx) {
    try {
      const { projekt, budget, kategorie } = await ctx.req.json();

      const message = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: `Erstelle professionelles Angebot fuer ${kategorie}:

Projekt: ${projekt}
Budget: EUR ${budget}

Format: Markdown, Titel, Leistungen, 75-95 EUR/h, 20-30% Material, Gesamtpreis, 2 Wochen gueltig.`,
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
        },
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        },
      );
    }
  },
});
