// src/hooks/usePayers.ts
import { useEffect, useState } from "react";

export interface Payer {
  id: string;
  name: string;
  states: string[];
  plans: string[];
  phone: string;
  portal_url: string;
  auth_required: boolean;
  turnaround_days: number;
  specialties: string[];
  notes?: string;
}

interface PayerResponse {
  page: number;
  pageSize: number;
  total: number;
  items: Payer[];
}

export function usePayers(params: {
  q?: string;
  state?: string;
  plan?: string;
  page?: number;
  pageSize?: number;
}) {
  const { q = "", state = "", plan = "", page = 1, pageSize = 10 } = params;

  const [data, setData] = useState<PayerResponse>({
    page,
    pageSize,
    total: 0,
    items: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    const sp = new URLSearchParams({
      q,
      state,
      plan,
      page: String(page),
      pageSize: String(pageSize),
    });

    setLoading(true);
    setError(null);

    fetch(`/api/payers?${sp.toString()}`, { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const ct = r.headers.get("content-type") || "";
        if (!ct.includes("application/json")) throw new Error("Unexpected response (not JSON)");
        return r.json();
      })
      .then((json: PayerResponse) => setData(json))
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || String(e));
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  }, [q, state, plan, page, pageSize]);

  return { ...data, loading, error };
}
