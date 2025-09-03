// root/api/upload.ts
// Vercel Serverless Function (Node runtime)
export const config = { runtime: "nodejs18.x" };

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

    const filename =
      (req.headers["x-filename"] as string | undefined) ?? "unnamed.bin";
    const filetype =
      (req.headers["x-file-type"] as string | undefined) ??
      "application/octet-stream";

    // read raw bytes
    const fileBuffer = await readStreamToBuffer(req);
    const size = fileBuffer.byteLength;

    // TODO: Persist to your storage (S3, Vercel Blob, etc.)
    // For now we return mock metadata:
    const url = `/uploads/${encodeURIComponent(filename)}`;

    res.setHeader("Content-Type", "application/json");
    res.status(200).json({
      ok: true,
      key: filename, // replace with storage key/id when you add real storage
      url,
      name: decodeURIComponent(filename),
      size,
      type: filetype,
    });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err?.message || "Upload failed" });
  }
}
