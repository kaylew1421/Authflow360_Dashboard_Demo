// src/components/PayerTable.tsx
import { useState } from "react";
import { usePayers, Payer } from "../hooks/usePayers";
import { useDebounce } from "../hooks/useDebounce";

export default function PayerTable() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("TX");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const qDebounced = useDebounce(q, 300);
  const { items, total, loading, error } = usePayers({
    q: qDebounced,
    state,
    plan,
    page,
    pageSize,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="border rounded px-3 py-2"
          value={q}
          onChange={(e) => {
            setPage(1);
            setQ(e.target.value);
          }}
          placeholder="Search payers or notes…"
        />
        <select
          className="border rounded px-3 py-2"
          value={state}
          onChange={(e) => {
            setPage(1);
            setState(e.target.value);
          }}
        >
          <option value="">All States</option>
          <option value="TX">TX</option>
          <option value="OK">OK</option>
          <option value="AR">AR</option>
          <option value="LA">LA</option>
          <option value="NM">NM</option>
        </select>
        <select
          className="border rounded px-3 py-2"
          value={plan}
          onChange={(e) => {
            setPage(1);
            setPlan(e.target.value);
          }}
        >
          <option value="">All Plans</option>
          <option value="HMO">HMO</option>
          <option value="PPO">PPO</option>
          <option value="POS">POS</option>
          <option value="EPO">EPO</option>
          <option value="ADVANTAGE">Advantage</option>
          <option value="ORIGINAL">Original</option>
        </select>
      </div>

      {loading && <div className="text-sm text-gray-600">Loading…</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">States</th>
              <th className="text-left p-2">Plans</th>
              <th className="text-left p-2">Turnaround</th>
              <th className="text-left p-2">Auth Required</th>
              <th className="text-left p-2">Portal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p: Payer) => (
              <tr key={p.id} className="border-t">
                <td className="p-2 font-medium">{p.name}</td>
                <td className="p-2">{p.states.join(", ")}</td>
                <td className="p-2">{p.plans.join(", ")}</td>
                <td className="p-2">{p.turnaround_days} days</td>
                <td className="p-2">{p.auth_required ? "Yes" : "No"}</td>
                <td className="p-2">
                  <a className="underline" href={p.portal_url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {!loading && items.length === 0 && (
              <tr>
                <td className="p-3 text-gray-600" colSpan={6}>
                  No results.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span className="text-sm">
          Page {page} of {totalPages}
        </span>
        <button
          className="border rounded px-3 py-1 disabled:opacity-50"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
