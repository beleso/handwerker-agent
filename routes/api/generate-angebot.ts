import { Anthropic } from "npm:@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: Deno.env.get("CLAUDE_API_KEY"),
});

export const handler = async (req: Request): Promise<Response> => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { projekt, budget, kategorie } = await req.json();

    // Input validation
    if (!projekt || !budget || !kategorie) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Claude API call
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Du bist ein professioneller Angebots-Generator für Handwerksbetriebe in Deutschland.

Generiere ein detailliertes, professionelles Angebot basierend auf folgenden Informationen:

**Projekttyp:** ${kategorie}
**Projektbeschreibung:** ${projekt}
**Budget:** €${budget}

Das Angebot soll enthalten:
1. Aussagekräftigen Titel
2. Projektbeschreibung (prägnant, 2-3 Sätze)
3. Leistungsumfang (mit Aufzählung der Arbeitsschritte)
4. Stundensätze (€75-95/h je nach Komplexität)
5. Materialkosten (20-30% der Arbeitskosten)
6. Gesamtpreis (sollte unter dem Budget liegen)
7. Gültigkeitsdauer (2 Wochen)
8. Kontaktinformationen Platzhalter

Formatiere das Angebot professionell mit Markdown. Es soll sofort per Email versendbar sein.`,
        },
      ],
    });

    const angebot = message.content[0].type === "text" ? message.content[0].text : "";

    return new Response(
      JSON.stringify({
        success: true,
        angebot,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate Angebot",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};
