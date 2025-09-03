// api/submissions.js
exports.config = { runtime: "nodejs" };

// In-memory (resets on cold start / redeploy)
let submissions = [];

function readJSON(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
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

module.exports = async function (req, res) {
  try {
    if (req.method === "GET") {
      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.setHeader("cache-control", "no-store");
      return res.end(JSON.stringify({ ok: true, items: submissions }));
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

      res.statusCode = 200;
      res.setHeader("content-type", "application/json");
      res.setHeader("cache-control", "no-store");
      return res.end(JSON.stringify({ ok: true, record }));
    }

    res.statusCode = 405;
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
  } catch (err) {
    console.error("submissions API error:", err && (err.stack || err));
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: String(err && (err.message || err)) }));
  }
};
