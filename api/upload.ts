// api/upload.ts
// Vercel Serverless Function (Node runtime, NOT edge)
export const config = { runtime: "nodejs" };

type VercelReq = NodeJS.ReadableStream & {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};
type VercelRes = {
  status: (code: number) => VercelRes;
  setHeader: (name: string, value: string) => void;
  json: (data: any) => void;
};

function readStreamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export default async function handler(req: VercelReq, res: VercelRes) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ ok: false, error: "Method Not Allowed" });
      return;
    }

    const filename = (req.headers["x-filename"] as string) || "unnamed.bin";
    const filetype =
      (req.headers["x-file-type"] as string) || "application/octet-stream";

    // read raw bytes (client sends the File directly as the body)
    const fileBuffer = await readStreamToBuffer(req);

    if (!fileBuffer || fileBuffer.length === 0) {
      res.status(400).json({ ok: false, error: "Empty body" });
      return;
    }

    // TODO: upload fileBuffer to storage (S3/Vercel Blob/etc.) and return a real URL
    const size = fileBuffer.byteLength;
    const url = `/uploads/${encodeURIComponent(filename)}`; // placeholder

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ok: true,
      key: filename, // swap to your storage key later
      url,
      name: decodeURIComponent(filename),
      size,
      type: filetype,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Upload failed" });
  }
}
