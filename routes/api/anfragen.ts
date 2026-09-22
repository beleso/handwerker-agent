import { define } from "../../utils.ts";
import { anfragenSpeicher } from "../../speicher.ts";

export const handler = define.handlers({
  async OPTIONS() {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  },
  async GET() {
    try {
      const anfragen = [...anfragenSpeicher].sort(
        (a, b) =>
          new Date(b.eingegangen).getTime() - new Date(a.eingegangen).getTime(),
      );

      return new Response(JSON.stringify({ success: true, anfragen }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  },
});
