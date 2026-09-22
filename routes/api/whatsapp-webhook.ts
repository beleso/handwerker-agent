import { Anthropic } from "npm:@anthropic-ai/sdk";
import { define } from "../../utils.ts";

const client = new Anthropic({
  apiKey: Deno.env.get("CLAUDE_API_KEY"),
});

interface Klassifikation {
  ist_seriös: boolean;
  ist_spam: boolean;
  kategorie: string;
  budget_einschätzung: string;
  dringlichkeit: "niedrig" | "mittel" | "hoch";
  zusammenfassung: string;
}

async function klassifiziereAnfrage(nachricht: string): Promise<Klassifikation> {
  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Du bist ein Anfrage-Router fuer einen Handwerksbetrieb. Analysiere die folgende eingehende WhatsApp-Nachricht eines potenziellen Kunden und antworte NUR mit einem JSON-Objekt (keine Erklaerung, kein Markdown), exakt in diesem Format:
{"ist_serioes": true, "ist_spam": false, "kategorie": "Elektro|Sanitaer|Dach|Maurer|Sonstiges", "budget_einschaetzung": "kurzer Text", "dringlichkeit": "niedrig|mittel|hoch", "zusammenfassung": "1-2 Saetze"}

Nachricht: "${nachricht}"`,
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "{}";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  try {
    return JSON.parse(jsonMatch ? jsonMatch[0] : "{}");
  } catch {
    return {
      ist_seriös: true,
      ist_spam: false,
      kategorie: "Sonstiges",
      budget_einschätzung: "unbekannt",
      dringlichkeit: "mittel",
      zusammenfassung: nachricht.slice(0, 200),
    };
  }
}

export const handler = define.handlers({
  async POST(ctx) {
    try {
      const form = await ctx.req.formData();
      const nachricht = String(form.get("Body") ?? "");
      const von = String(form.get("From") ?? "");
      const profilName = String(form.get("ProfileName") ?? "");

      const klassifikation = await klassifiziereAnfrage(nachricht);

      const kv = await Deno.openKv();
      const id = crypto.randomUUID();
      await kv.set(["anfragen", id], {
        id,
        von,
        profilName,
        nachricht,
        klassifikation,
        eingegangen: new Date().toISOString(),
        status: klassifikation.ist_spam ? "spam" : "neu",
      });

      const antwortText = klassifikation.ist_spam
        ? ""
        : "Danke fuer deine Anfrage! Wir melden uns in Kuerze bei dir.";

      const twiml = antwortText
        ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${antwortText}</Message></Response>`
        : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

      return new Response(twiml, {
        headers: { "Content-Type": "text/xml" },
      });
    } catch (error) {
      console.error("WhatsApp Webhook Fehler:", error);
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } },
      );
    }
  },
});

