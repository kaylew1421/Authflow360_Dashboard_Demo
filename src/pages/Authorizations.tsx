// src/pages/Authorizations.tsx
import { useEffect, useMemo, useState, FormEvent } from "react";
import { usePayers, Payer } from "../hooks/usePayers";
import PayerTable from "../components/PayerTable";

type ErrorState = Partial<{
  patientName: string;
  dob: string;
  payerId: string;
  cpt: string;
  icd10: string;
}>;

type Submission = {
  id: string;
  createdAt: string; // ISO
  patientName: string;
  dob: string;
  payerId: string;
  payerName: string;
  cpt: string;
  icd10: string;
  urgency: "Routine" | "Urgent" | "Emergent";
  notes: string;
  status: string;
  etaDays: number;
};

export default function Authorizations() {
  // ---- Form state ----
  const [patientName, setPatientName] = useState<string>("");
  const [dob, setDob] = useState<string>("");
  const [payerId, setPayerId] = useState<string>("");
  const [cpt, setCpt] = useState<string>("");
  const [icd10, setIcd10] = useState<string>("");
  const [urgency, setUrgency] = useState<Submission["urgency"]>("Routine");
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  // demo-only local submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // ---- Payers from API ----
  const { items: payerItems, loading: payerLoading, error: payerError } = usePayers({
    q: "",
    state: "TX", // set "" to load all states
    plan: "",
    page: 1,
    pageSize: 50,
  });

  const payerOptions = useMemo(
    () =>
      payerItems.map((p: Payer) => ({
        id: p.id,
        name: p.name,
        plans: p.plans,
        states: p.states,
        authRequired: p.auth_required,
        turnaround: p.turnaround_days,
      })),
    [payerItems]
  );

  const selectedPayer = useMemo(
    () => payerOptions.find((p) => p.id === payerId),
    [payerId, payerOptions]
  );

  // ---- Validation ----
  function validate(): boolean {
    const e: ErrorState = {};
    if (!patientName.trim()) e.patientName = "Patient name is required.";
    if (!dob) e.dob = "Date of birth is required.";
    if (!payerId) e.payerId = "Please select a payer.";
    if (!cpt.trim()) e.cpt = "CPT code is required.";
    if (!/^\d{5}$/.test(cpt.trim())) e.cpt = "CPT must be 5 digits (e.g., 70450).";
    if (!icd10.trim()) e.icd10 = "Diagnosis (ICD-10) is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ---- Submit (simulated) ----
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    // simulate API latency
    await new Promise((r) => setTimeout(r, 700));

    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());

    const record: Submission = {
      id,
      createdAt: new Date().toISOString(),
      patientName,
      dob,
      payerId,
      payerName: selectedPayer?.name ?? "",
      cpt: cpt.trim(),
      icd10: icd10.trim().toUpperCase(),
      urgency,
      notes: notes.trim(),
      status: selectedPayer?.authRequired ? "Submitted (PA Required)" : "Not Required",
      etaDays: selectedPayer?.turnaround ?? 0,
    };

    setSubmissions((prev) => [record, ...prev].slice(0, 10));
    setSubmitting(false);

    // reset some fields; keep payer for speed
    setCpt("");
    setIcd10("");
    setUrgency("Routine");
    setNotes("");
    alert(
      `Authorization ${record.status}${record.etaDays ? ` • ETA ${record.etaDays}d` : ""}`
    );
  }

  // Auto-select first payer when loaded
  useEffect(() => {
    if (!payerLoading && !payerError && payerOptions.length && !payerId) {
      setPayerId(payerOptions[0].id);
    }
  }, [payerLoading, payerError, payerOptions, payerId]);

  return (
    <div className="p-4 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Authorizations</h1>
        <p className="text-gray-600">
          Submit a prior auth request and explore payer rules, plans, and turnaround times.
        </p>
      </header>

      {/* ===== Authorization Form ===== */}
      <section className="border rounded-lg p-4 space-y-4">
        <h2 className="text-xl font-semibold">New Authorization Request</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Patient Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Patient Name</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Jane Doe"
            />
            {errors.patientName && (
              <p className="text-sm text-red-600">{errors.patientName}</p>
            )}
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
            {errors.dob && <p className="text-sm text-red-600">{errors.dob}</p>}
          </div>

          {/* Payer */}
          <div>
            <label className="block text-sm font-medium mb-1">Payer</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
              disabled={payerLoading || !!payerError}
            >
              <option value="">{payerLoading ? "Loading payers…" : "Select a payer"}</option>
              {payerOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.payerId && <p className="text-sm text-red-600">{errors.payerId}</p>}
            {selectedPayer && (
              <p className="text-xs text-gray-600 mt-1">
                {selectedPayer.authRequired ? "PA required" : "PA not required"} • Turnaround:{" "}
                {selectedPayer.turnaround}d • Plans: {selectedPayer.plans.join(", ")}
              </p>
            )}
            {payerError && (
              <p className="text-sm text-red-600">Error loading payers: {payerError}</p>
            )}
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium mb-1">Urgency</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={urgency}
              onChange={(e) =>
                setUrgency(e.target.value as Submission["urgency"])
              }
            >
              <option>Routine</option>
              <option>Urgent</option>
              <option>Emergent</option>
            </select>
          </div>

          {/* CPT */}
          <div>
            <label className="block text-sm font-medium mb-1">CPT Code</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={cpt}
              onChange={(e) => setCpt(e.target.value)}
              placeholder="70450"
              inputMode="numeric"
              maxLength={5}
            />
            {errors.cpt && <p className="text-sm text-red-600">{errors.cpt}</p>}
          </div>

          {/* ICD-10 */}
          <div>
            <label className="block text-sm font-medium mb-1">Diagnosis (ICD-10)</label>
            <input
              className="w-full border rounded px-3 py-2 uppercase"
              value={icd10}
              onChange={(e) => setIcd10(e.target.value)}
              placeholder="R51.9"
            />
            {errors.icd10 && <p className="text-sm text-red-600">{errors.icd10}</p>}
          </div>

          {/* Notes (full width) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Attach clinical justification, prior imaging, etc."
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="border rounded px-4 py-2 bg-black text-white disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Authorization"}
            </button>
            {selectedPayer && (
              <span className="text-sm text-gray-600">
                {selectedPayer.authRequired
                  ? "This payer typically requires prior auth for many CPTs."
                  : "This payer may not require prior auth for most CPTs."}
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ===== Recent Submissions (local demo) ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Recent Submissions (Demo)</h2>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Patient</th>
                <th className="text-left p-2">Payer</th>
                <th className="text-left p-2">CPT</th>
                <th className="text-left p-2">ICD-10</th>
                <th className="text-left p-2">Urgency</th>
                <th className="text-left p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-600" colSpan={7}>
                    No submissions yet.
                  </td>
                </tr>
              )}
              {submissions.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="p-2">{s.patientName}</td>
                  <td className="p-2">{s.payerName}</td>
                  <td className="p-2">{s.cpt}</td>
                  <td className="p-2">{s.icd10}</td>
                  <td className="p-2">{s.urgency}</td>
                  <td className="p-2">
                    {s.status}
                    {s.etaDays ? ` • ETA ${s.etaDays}d` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Live Payer Directory ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Payer Directory</h2>
        <PayerTable />
      </section>
    </div>
  );
}
