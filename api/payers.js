// api/payers.js
exports.config = { runtime: "nodejs" };

module.exports = function (req, res) {
  try {
    if (req.method !== "GET") {
      res.statusCode = 405;
      res.setHeader("content-type", "application/json");
      return res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
    }

    const items = [
      { id: "bcbs-tx",  name: "Blue Cross Blue Shield of Texas", states: ["TX"], plans: ["PPO","HMO"], auth_required: true,  turnaround_days: 3 },
      { id: "aetna",    name: "Aetna",                            states: ["TX"], plans: ["POS"],      auth_required: true,  turnaround_days: 5 },
      { id: "medicare", name: "Medicare (TX)",                    states: ["TX"], plans: ["Original"],  auth_required: false, turnaround_days: 0 },
    ];

    res.statusCode = 200;
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "no-store");
    return res.end(JSON.stringify({ ok: true, items }));
  } catch (err) {
    console.error("payers API error:", err && (err.stack || err));
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: String(err && (err.message || err)) }));
  }
};
