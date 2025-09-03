export const config = { runtime: "edge" };

type Payer = {
  id: string;
  name: string;
  states: string[];
  plans: string[];
  phone: string;
  portal_url: string;
  auth_required: boolean;
  turnaround_days: number;
  specialties: string[];
  notes?: string;
};

const PAYERS: Payer[] = [
  { id: "bcbs-tx", name: "Blue Cross Blue Shield of Texas", states: ["TX"], plans: ["PPO","HMO"], phone: "1-800-000-0000", portal_url: "https://example.com/bcbstx", auth_required: true, turnaround_days: 3, specialties: ["Cardiology","Orthopedics","Imaging"], notes: "Use Availity portal; CPT 70450 requires prior auth" },
  { id: "aetna-nat", name: "Aetna National", states: ["TX","OK","LA","NM"], plans: ["PPO","POS"], phone: "1-800-111-1111", portal_url: "https://example.com/aetna", auth_required: true, turnaround_days: 2, specialties: ["Imaging","Oncology"], notes: "Expedited auth possible with clinical notes" },
  { id: "medicare-tx", name: "Medicare (Texas)", states: ["TX"], plans: ["Original","Advantage"], phone: "1-800-MEDICARE", portal_url: "https://example.com/medicare-tx", auth_required: false, turnaround_days: 0, specialties: ["All"], notes: "Traditional Medicare usually no PA; MA plans vary" },
  { id: "uhc-south", name: "UnitedHealthcare South Region", states: ["TX","OK","AR"], plans: ["HMO","EPO"], phone: "1-800-222-2222", portal_url: "https://example.com/uhc", auth_required: true, turnaround_days: 4, specialties: ["Cardiology","GI","Imaging"], notes: "Site-of-service rules apply for high-tech imaging" }
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type, Authorization",
    },
  });
}

export default async function handler(req: Request) {
  try {
    if (req.method === "OPTIONS") return json({}, 200);
    if (req.method !== "GET") return json({ error: "Method Not Allowed" }, 405);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase();
    const state = (searchParams.get("state") || "").toUpperCase();
    const plan = (searchParams.get("plan") || "").toUpperCase();
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Math.min(Number(searchParams.get("pageSize") || 10), 50);

    let results = [...PAYERS];

    if (q) {
      results = results.filter(
        (r) => r.name.toLowerCase().includes(q) || (r.notes || "").toLowerCase().includes(q)
      );
    }
    if (state) results = results.filter((r) => r.states.includes(state));
    if (plan) results = results.filter((r) => r.plans.map((p) => p.toUpperCase()).includes(plan));

    const total = results.length;
    const start = (page - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    return json({ page, pageSize, total, items }, 200);
  } catch (err: any) {
    // Edge runtime will include this in vercel logs
    console.error("payers edge error:", err?.message || err);
    return json({ error: "Internal Server Error", message: String(err?.message || err) }, 500);
  }
}
