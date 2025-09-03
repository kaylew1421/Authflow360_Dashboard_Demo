// /api/submissions.ts
export const config = { runtime: "edge" };
import { neon, neonConfig } from "@neondatabase/serverless";
neonConfig.fetchConnectionCache = true;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization",
    },
  });
}

// Lazy init so import won't crash if env missing
let _sql: ReturnType<typeof neon> | null = null;
function getSql() {
  const url = process.env.POSTGRES_URL;
  if (!url) throw new Error("Missing POSTGRES_URL");
  if (!_sql) _sql = neon(url);
  return _sql;
}

async function ensureSchema() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
      id           TEXT PRIMARY KEY,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      patient_name TEXT NOT NULL,
      dob          TEXT NOT NULL,
      payer_id     TEXT NOT NULL,
      payer_name   TEXT NOT NULL,
      cpt          TEXT NOT NULL,
      icd10        TEXT NOT NULL,
      urgency      TEXT NOT NULL,
      notes        TEXT,
      status       TEXT NOT NULL,
      eta_days     INTEGER NOT NULL DEFAULT 0,
      meta_json    JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `;
  // if table existed already, make sure meta_json exists
  await sql`ALTER TABLE submissions
            ADD COLUMN IF NOT EXISTS meta_json JSONB NOT NULL DEFAULT '{}'::jsonb;`;
  await sql`CREATE INDEX IF NOT EXISTS submissions_created_at_idx ON submissions (created_at DESC);`;
}

export default async function handler(req: Request) {
  try {
    if (req.method === "OPTIONS") return json({});
    await ensureSchema();

    const sql = getSql();

    if (req.method === "GET") {
      const rows = await sql<{
        id: string; created_at: string; patient_name: string; dob: string;
        payer_id: string; payer_name: string; cpt: string; icd10: string;
        urgency: string; notes: string | null; status: string; eta_days: number | null;
        meta_json: any;
      }[]>`SELECT * FROM submissions ORDER BY created_at DESC LIMIT 50;`;

      const items = rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        patientName: r.patient_name,
        dob: r.dob,
        payerId: r.payer_id,
        payerName: r.payer_name,
        cpt: r.cpt,
        icd10: r.icd10,
        urgency: r.urgency as "Routine" | "Urgent" | "Emergent",
        notes: r.notes ?? "",
        status: r.status,
        etaDays: Number(r.eta_days ?? 0),
        meta: r.meta_json ?? {},
      }));
      return json({ items });
    }

    if (req.method === "POST") {
      const body = (await req.json()) as any;
      const required = ["patientName", "dob", "payerId", "payerName", "cpt", "icd10", "urgency", "status"];
      const missing = required.filter((k) => !body?.[k]);
      if (missing.length) return json({ error: "Missing fields", missing }, 400);

      const id = crypto.randomUUID();
      const meta = body.meta ?? {}; // provider/patient/appointment/codes, etc.

      const ret = await sql<{ created_at: string }[]>`
        INSERT INTO submissions
          (id, patient_name, dob, payer_id, payer_name, cpt, icd10, urgency, notes, status, eta_days, meta_json)
        VALUES
          (${id}, ${body.patientName.trim()}, ${body.dob}, ${body.payerId}, ${body.payerName},
           ${String(body.cpt).trim()}, ${String(body.icd10).trim().toUpperCase()},
           ${body.urgency}, ${String(body.notes || "").trim()}, ${body.status}, ${Number(body.etaDays || 0)},
           ${meta}::jsonb)
        RETURNING created_at;
      `;

      const createdAt = ret[0].created_at;

      return json(
        {
          ok: true,
          record: {
            id,
            createdAt,
            patientName: body.patientName.trim(),
            dob: body.dob,
            payerId: body.payerId,
            payerName: body.payerName,
            cpt: String(body.cpt).trim(),
            icd10: String(body.icd10).trim().toUpperCase(),
            urgency: body.urgency,
            notes: String(body.notes || "").trim(),
            status: body.status,
            etaDays: Number(body.etaDays || 0),
            meta,
          },
        },
        201
      );
    }

    return json({ error: "Method Not Allowed" }, 405);
  } catch (e: any) {
    return json({ error: "Server error", message: String(e?.message || e) }, 500);
  }
}
