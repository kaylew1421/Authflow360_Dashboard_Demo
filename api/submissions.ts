// /api/submissions.ts
export const config = { runtime: "edge" };

import { neon } from "@neondatabase/serverless";

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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

const sql = neon(process.env.POSTGRES_URL!);

async function ensureSchema() {
  // id as text (we generate with crypto.randomUUID), meta as jsonb
  await sql`
    create table if not exists submissions (
      id text primary key,
      created_at timestamptz not null default now(),
      patient_name text not null,
      dob text not null,
      payer_id text not null,
      payer_name text not null,
      cpt text,
      icd10 text,
      urgency text not null,
      status text not null,
      eta_days int not null default 0,
      notes text,
      meta jsonb
    )`;
}

export default async function handler(req: Request) {
  try {
    await ensureSchema();

    if (req.method === "GET") {
      const rows = (await sql`
        select id,
               created_at,
               patient_name,
               dob,
               payer_id,
               payer_name,
               cpt,
               icd10,
               urgency,
               status,
               eta_days,
               notes,
               meta
        from submissions
        order by created_at desc
        limit 50
      `) as unknown as Array<Record<string, any>>;

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

      return json({ items });
    }

    if (req.method === "POST") {
      const body = await req.json();

      const id = crypto.randomUUID();
      const created = (await sql`
        insert into submissions
          (id, patient_name, dob, payer_id, payer_name, cpt, icd10, urgency, status, eta_days, notes, meta)
        values
          (${id},
           ${body.patientName},
           ${body.dob},
           ${body.payerId},
           ${body.payerName},
           ${body.cpt ?? ""},
           ${body.icd10 ?? ""},
           ${body.urgency ?? "Routine"},
           ${body.status ?? "Submitted"},
           ${body.etaDays ?? 0},
           ${body.notes ?? ""},
           ${JSON.stringify(body.meta) ?? null})
        returning id, created_at, patient_name, dob, payer_id, payer_name, cpt, icd10, urgency, status, eta_days, notes, meta
      `) as unknown as Array<Record<string, any>>;

      const r = created[0];
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

      return json({ ok: true, record }, 201);
    }

    return json({ error: "Method Not Allowed" }, 405);
  } catch (e: any) {
    console.error("submissions error:", e?.stack || e);
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}
