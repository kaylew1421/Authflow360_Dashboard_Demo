// api/submissions.ts
export const config = { runtime: "nodejs" };

import { neon } from "@neondatabase/serverless";

type SubmissionRow = Record<string, any>;
type Submission = {
  id: string;
  createdAt: string;
  patientName: string;
  dob: string;
  payerId: string;
  payerName: string;
  cpt: string;
  icd10: string;
  urgency: "Routine" | "Urgent" | "Emergent";
  status: string;
  etaDays: number;
  notes: string;
  meta: unknown;
};

function sendJSON(res: any, data: unknown, status = 200) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store");
  res.end(JSON.stringify(data));
}

function setCORS(res: any) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "Content-Type, Authorization");
}

async function readJSON(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk: Buffer) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

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
    create table if not exists submissions (
      id           text primary key,
      created_at   timestamptz not null default now(),
      patient_name text not null,
      dob          text not null,
      payer_id     text not null,
      payer_name   text not null,
      cpt          text,
      icd10        text,
      urgency      text not null,
      status       text not null,
      eta_days     int  not null default 0,
      notes        text,
      meta         jsonb
    )
  `;
}

export default async function handler(req: any, res: any) {
  try {
    setCORS(res);

    if (req.method === "OPTIONS") return sendJSON(res, {}, 200);
    if (!["GET", "POST"].includes(req.method)) {
      return sendJSON(res, { error: "Method Not Allowed" }, 405);
    }

    await ensureSchema();
    const sql = getSql();

    if (req.method === "GET") {
      const rows = (await sql`
        select id, created_at, patient_name, dob, payer_id, payer_name,
               cpt, icd10, urgency, status, eta_days, notes, meta
        from submissions
        order by created_at desc
        limit 50
      `) as unknown as SubmissionRow[];

      const items: Submission[] = rows.map((r) => ({
        id: String(r.id),
        createdAt: new Date(r.created_at).toISOString(),
        patientName: String(r.patient_name),
        dob: String(r.dob),
        payerId: String(r.payer_id),
        payerName: String(r.payer_name),
        cpt: r.cpt ? String(r.cpt) : "",
        icd10: r.icd10 ? String(r.icd10) : "",
        urgency: (r.urgency || "Routine") as Submission["urgency"],
        status: String(r.status),
        etaDays: Number(r.eta_days ?? 0),
        notes: r.notes ? String(r.notes) : "",
        meta: r.meta ?? null,
      }));

      return sendJSON(res, { items });
    }

    // POST
    const body = await readJSON(req);
    const id = (globalThis.crypto ?? require("node:crypto")).randomUUID?.() || `${Date.now()}`;

    const result = (await sql`
      insert into submissions
        (id, patient_name, dob, payer_id, payer_name, cpt, icd10,
         urgency, status, eta_days, notes, meta)
      values
        (${id},
         ${String(body.patientName || "")},
         ${String(body.dob || "")},
         ${String(body.payerId || "")},
         ${String(body.payerName || "")},
         ${String(body.cpt || "")},
         ${String(body.icd10 || "")},
         ${String(body.urgency || "Routine")},
         ${String(body.status || "Submitted")},
         ${Number(body.etaDays || 0)},
         ${String(body.notes || "")},
         ${JSON.stringify(body.meta ?? null)}::jsonb)
      returning id, created_at, patient_name, dob, payer_id, payer_name,
                cpt, icd10, urgency, status, eta_days, notes, meta
    `) as unknown as SubmissionRow[];

    const r = result[0];
    const record: Submission = {
      id: String(r.id),
      createdAt: new Date(r.created_at).toISOString(),
      patientName: String(r.patient_name),
      dob: String(r.dob),
      payerId: String(r.payer_id),
      payerName: String(r.payer_name),
      cpt: r.cpt ? String(r.cpt) : "",
      icd10: r.icd10 ? String(r.icd10) : "",
      urgency: (r.urgency || "Routine") as Submission["urgency"],
      status: String(r.status),
      etaDays: Number(r.eta_days ?? 0),
      notes: r.notes ? String(r.notes) : "",
      meta: r.meta ?? null,
    };

    return sendJSON(res, { ok: true, record }, 201);
  } catch (e: any) {
    console.error("submissions error:", e?.stack || e);
    return sendJSON(res, { ok: false, error: String(e?.message || e) }, 500);
  }
}
