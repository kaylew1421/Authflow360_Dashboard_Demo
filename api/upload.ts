// /api/upload.ts
export const config = { runtime: "edge" };
import { put } from "@vercel/blob";

const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), {
    status: s,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "Content-Type",
    },
  });

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return json({});
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return json({ error: "No file provided" }, 400);
  if (file.size > 10 * 1024 * 1024) return json({ error: "Max 10MB" }, 413);

  const key = `submissions/${Date.now()}-${crypto.randomUUID()}-${file.name}`;
  const { url } = await put(key, file, {
    access: "private",
    contentType: file.type || "application/octet-stream",
  });

  return json({ ok: true, key, url, name: file.name, size: file.size, type: file.type });
}
