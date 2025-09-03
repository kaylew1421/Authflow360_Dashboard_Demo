// /api/upload.ts
export const config = { runtime: "edge" };

import { put } from "@vercel/blob";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export default async function handler(req: Request) {
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return json({ ok: false, error: "No file provided" }, 400);

    const blob = await put(file.name, file, {
      access: "public",          // <-- change from "private"
      addRandomSuffix: true,
    });

    return json({
      ok: true,
      key: blob.pathname,
      url: blob.url,
      name: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, 500);
  }
}
