// src/lib/upload.ts
export type Attachment = {
  key: string;
  url: string;
  name: string;
  size: number;
  type: string;
};

export async function uploadAttachment(file: File): Promise<Attachment> {
  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "content-type": file.type || "application/octet-stream",
      "x-filename": encodeURIComponent(file.name),
      "x-file-type": file.type || "application/octet-stream",
    },
    body: file, // raw bytes
  });

  if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`);

  const data = await res.json();
  if (!data?.ok) throw new Error(data?.error || "Upload failed");

  // normalize to Attachment type
  return {
    key: data.key,
    url: data.url,
    name: data.name,
    size: data.size,
    type: data.type,
  } as Attachment;
}
