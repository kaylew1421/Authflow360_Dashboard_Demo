export const config = { runtime: "edge" };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    },
  });
}

export default async function handler(_req: Request) {
  return json({ ok: true, time: new Date().toISOString() });
}
