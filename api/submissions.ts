// api/submissions.ts
export const config = { runtime: "nodejs" };

// In-memory (resets on cold start/redeploy)
let submissions: any[] = [];

type VReq = NodeJS.ReadableStream & { method?: string };
type VRes = { status: (n: number) => void; setHeader: (k: string, v: string) => void; json: (b: any) => void };

async function readJSON(req: NodeJS.ReadableStream): Promise<any> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on("end", () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: VReq, res: VRes) {
  try {
    if (req.method === "GET") {
      res.status(200);
      res.setHeader("content-type", "application/json");
      res.setHeader("cache-control", "no-store");
      return res.json({ ok: true, items: submissions });
    }

    if (req.method === "POST") {
      const body = await readJSON(req);
      const record = {
        ...body,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
      };
      submissions.unshift(record);
      submissions = submissions.slice(0, 50);

      res.status(200);
      res.setHeader("content-type", "application/json");
      res.setHeader("cache-control", "no-store");
      return res.json({ ok: true, record });
    }

    res.status(405);
    res.setHeader("content-type", "application/json");
    return res.json({ ok: false, error: "Method Not Allowed" });
  } catch (err: any) {
    console.error("submissions mock error:", err?.stack || err);
    res.status(500);
    res.setHeader("content-type", "application/json");
    return res.json({ ok: false, error: err?.message || "Server error" });
  }
}
