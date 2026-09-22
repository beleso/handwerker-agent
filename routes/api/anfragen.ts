import { define } from "../../utils.ts";

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
      const kv = await Deno.openKv();
      const entries = kv.list({ prefix: ["anfragen"] });
      // deno-lint-ignore no-explicit-any
      const anfragen: any[] = [];
      for await (const entry of entries) {
        anfragen.push(entry.value);
      }
      anfragen.sort(
        // deno-lint-ignore no-explicit-any
        (a: any, b: any) =>
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

