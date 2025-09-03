// api/payers.ts
// Force Node runtime so we don't hit Edge bundling issues
export const config = { runtime: "nodejs" };

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

// In-memory demo dataset
const PAYERS: Payer[] = [
  {
    id: "bcbs-tx",
    name: "Blue Cross Blue Shield of Texas",
    states: ["TX"],
    plans: ["PPO", "HMO"],
    phone: "1-800-000-0000",
    portal_url: "https://example.com/bcbstx",
    auth_required: true,
    turnaround_days: 3,
    specialties: ["Cardiology", "Orthopedics", "Imaging"],
    notes: "Use Availity portal; CPT 70450 requires prior auth",
  },
  {
    id: "aetna-nat",
    name: "Aetna National",
    states: ["TX", "OK", "LA", "NM"],
    plans: ["PPO", "POS"],
    phone: "1-800-111-1111",
    portal_url: "https://example.com/aetna",
    auth_required: true,
    turnaround_days: 2,
    specialties: ["Imaging", "Oncology"],
    notes: "Expedited auth possible with clinical notes",
  },
  {
    id: "medicare-tx",
    name: "Medicare (Texas)",
    states: ["TX"],
    plans: ["Original", "Advantage"],
    phone: "1-800-MEDICARE",
    portal_url: "https://example.com/medicare-tx",
    auth_required: false,
    turnaround_days: 0,
    specialties: ["All"],
    notes: "Traditional Medicare usually no PA; MA plans vary",
  },
  {
    id: "uhc-south",
    name: "UnitedHealthcare South Region",
    states: ["TX", "OK", "AR"],
    plans: ["HMO", "EPO"],
    phone: "1-800-222-2222",
    portal_url: "https://example.com/uhc",
    auth_required: true,
    turnaround_days: 4,
    specialties: ["Cardiology", "GI", "Imaging"],
    notes: "Site-of-service rules apply for high-tech imaging",
  },
];

function setCors(res: any) {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "GET, OPTIONS");
  res.setHeader("access-control-allow-headers", "Content-Type, Authorization");
}

export default function handler(req: any, res: any) {
  try {
    setCors(res);

    if (req.method === "OPTIONS") {
      res.statusCode = 200;
      return res.end();
    }

    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("content-type", "application/json");
      return res.end(JSON.stringify({ error: "Method Not Allowed" }));
    }

    // Build a safe absolute URL (Node runtime)
    const base =
      (req.headers && req.headers.host)
        ? `https://${req.headers.host}`
        : "http://localhost";
    const url = new URL(req.url || "/api/payers", base);

    const q = (url.searchParams.get("q") || "").toLowerCase();
    const state = (url.searchParams.get("state") || "").toUpperCase();
    const plan = (url.searchParams.get("plan") || "").toUpperCase();
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("pageSize") || "10", 10))
    );

    let results = PAYERS.slice();

    if (q) {
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.notes?.toLowerCase() || "").includes(q)
      );
    }
    if (state) results = results.filter((r) => r.states.includes(state));
    if (plan)
      results = results.filter((r) =>
        r.plans.some((p) => p.toUpperCase() === plan)
      );

    const total = results.length;
    const start = (page - 1) * pageSize;
    const items = results.slice(start, start + pageSize);

    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "no-store");
    res.end(JSON.stringify({ page, pageSize, total, items }));
  } catch (err: any) {
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(
      JSON.stringify({
        error: "Server error",
        message: String(err?.message || err),
      })
    );
  }
}
