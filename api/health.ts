// /api/health.ts
export const config = { runtime: "edge" };
import { neon } from "@neondatabase/serverless";

export default async function handler() {
  try {
    const sql = neon(process.env.POSTGRES_URL!);   // ensure var exists in Vercel
    const rows = await sql`select 1 as ok`;
    return new Response(
      JSON.stringify({ ok: true, db: rows?.[0]?.ok === 1 }),
      { headers: { "content-type": "application/json" } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(e?.message || e) }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
