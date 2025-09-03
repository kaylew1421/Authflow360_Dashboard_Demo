// src/pages/Authorizations.tsx
import { useEffect, useMemo, useState, FormEvent } from "react";
import { usePayers } from "../hooks/usePayers";
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
  createdAt: string;
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
  meta?: any;
};

type AppointmentType = "Office" | "Outpatient" | "Inpatient" | "Imaging" | "Telehealth";

const parseList = (s: string) =>
  Array.from(new Set(s.split(",").map((x) => x.trim()).filter(Boolean)));

export default function Authorizations() {
  // ---- core form ----
  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [payerId, setPayerId] = useState("");
  const [cpt, setCpt] = useState("");           // blank default
  const [icd10, setIcd10] = useState("");       // blank default
  const [urgency, setUrgency] = useState<Submission["urgency"]>("Routine");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitting, setSubmitting] = useState(false);

  // ---- provider info (no facility fields) ----
  const [provName, setProvName] = useState("");
  const [provNpi, setProvNpi] = useState("");
  const [provPhone, setProvPhone] = useState("");
  const [provFax, setProvFax] = useState("");

  // ---- patient info ----
  const [memberId, setMemberId] = useState("");
  const [patientSex, setPatientSex] = useState<"F" | "M" | "X" | "U" | "">("");

  // ---- appointment ----
  const [apptType, setApptType] = useState<AppointmentType>("Imaging");
  const [serviceDate, setServiceDate] = useState("");

  // ---- multi-code inputs ----
  const [cptList, setCptList] = useState("");
  const [icdList, setIcdList] = useState("");

  // ---- attachments ----
  type Attachment = { key: string; url: string; name: string; size: number; type: string };
  const [files, setFiles] = useState<File[]>([]);
  const [fileInputKey, setFileInputKey] = useState(0);

  // ---- submissions ----
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // ---- payers ----
  const { items: payerItems, loading: payerLoading, error: payerError } = usePayers({
    q: "", state: "TX", plan: "", page: 1, pageSize: 50,
  });

  const payerOptions = useMemo(
    () => payerItems.map((p) => ({
      id: p.id, name: p.name, plans: p.plans, states: p.states,
      authRequired: p.auth_required, turnaround: p.turnaround_days,
    })),
    [payerItems]
  );
  const selectedPayer = useMemo(() => payerOptions.find((p) => p.id === payerId), [payerId, payerOptions]);

  // load recent
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/submissions");
        const ct = r.headers.get("content-type") || "";
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        if (!ct.includes("application/json")) throw new Error("Unexpected response (not JSON)");
        const { items } = (await r.json()) as { items: Submission[] };
        setSubmissions(items);
      } catch (e) {
        console.error("Load submissions failed:", e);
      }
    })();
  }, []);

  // auto-select first payer
  useEffect(() => {
    if (!payerLoading && !payerError && payerOptions.length && !payerId) {
      setPayerId(payerOptions[0].id);
    }
  }, [payerLoading, payerError, payerOptions, payerId]);

  // validation (CPT optional; must be 5 digits if provided)
  function validate(): boolean {
    const e: ErrorState = {};
    if (!patientName.trim()) e.patientName = "Patient name is required.";
    if (!dob) e.dob = "Date of birth is required.";
    if (!payerId) e.payerId = "Please select a payer.";
    if (cpt && !/^\d{5}$/.test(cpt.trim())) e.cpt = "CPT must be 5 digits (e.g., 70450).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function uploadFile(file: File): Promise<Attachment> {
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error(`Upload failed: HTTP ${r.status}`);
    const data = (await r.json()) as Attachment & { ok: boolean };
    return { key: data.key, url: data.url, name: data.name, size: data.size, type: data.type };
  }

  // submit
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1) upload files
      const uploaded: Attachment[] = [];
      for (const f of files) uploaded.push(await uploadFile(f));

      // 2) build meta (no facility fields)
      const meta = {
        provider: {
          name: provName.trim(),
          npi: provNpi.trim(),
          phone: provPhone.trim(),
          fax: provFax.trim(),
        },
        patient: { memberId: memberId.trim(), sex: patientSex || undefined },
        appointment: { type: apptType, serviceDate: serviceDate || undefined },
        codes: { cpts: parseList(cptList || cpt), icd10s: parseList(icdList || icd10) },
        attachments: uploaded,
      };

      // 3) POST submission
      const payload = {
        patientName, dob, payerId,
        payerName: selectedPayer?.name ?? "",
        cpt: meta.codes.cpts[0] ?? "",
        icd10: meta.codes.icd10s[0] ?? "",
        urgency, notes: notes.trim(),
        status: selectedPayer?.authRequired ? "Submitted (PA Required)" : "Not Required",
        etaDays: selectedPayer?.turnaround ?? 0,
        meta,
      };

      const r = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const ct = r.headers.get("content-type") || "";
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      if (!ct.includes("application/json")) throw new Error("Unexpected response (not JSON)");
      const { record } = (await r.json()) as { ok: boolean; record: Submission };
      setSubmissions((prev) => [record, ...prev].slice(0, 50));

      // reset convenience
      setCpt(""); setIcd10(""); setCptList(""); setIcdList("");
      setUrgency("Routine"); setNotes("");
      setFiles([]); setFileInputKey((k) => k + 1);
    } catch (err: any) {
      alert(`Submit failed: ${err?.message || String(err)}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-4 space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Authorizations</h1>
        <p className="text-gray-600">Submit prior auth requests and browse payer rules, plans, and turnaround times.</p>
      </header>

      {/* ===== Authorization Form ===== */}
      <section className="border rounded-lg p-4 space-y-6">
        <h2 className="text-xl font-semibold">New Authorization Request</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient & Payer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Patient Name</label>
              <input className="w-full border rounded px-3 py-2" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Jane Doe" />
              {errors.patientName && <p className="text-sm text-red-600">{errors.patientName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" className="w-full border rounded px-3 py-2" value={dob} onChange={(e) => setDob(e.target.value)} />
              {errors.dob && <p className="text-sm text-red-600">{errors.dob}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payer</label>
              <select className="w-full border rounded px-3 py-2" value={payerId} onChange={(e) => setPayerId(e.target.value)} disabled={payerLoading || !!payerError}>
                <option value="">{payerLoading ? "Loading payers…" : "Select a payer"}</option>
                {payerOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.payerId && <p className="text-sm text-red-600">{errors.payerId}</p>}
              {selectedPayer && (
                <p className="text-xs text-gray-600 mt-1">
                  {selectedPayer.authRequired ? "PA required" : "PA not required"} • Turnaround: {selectedPayer.turnaround}d • Plans: {selectedPayer.plans.join(", ")}
                </p>
              )}
              {payerError && <p className="text-sm text-red-600">Error loading payers: {payerError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Urgency</label>
              <select className="w-full border rounded px-3 py-2" value={urgency} onChange={(e) => setUrgency(e.target.value as Submission["urgency"])}>
                <option>Routine</option><option>Urgent</option><option>Emergent</option>
              </select>
            </div>
          </div>

          {/* Provider Info (no facility) */}
          <div className="space-y-3">
            <h3 className="font-semibold">Provider Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border rounded px-3 py-2" placeholder="Provider Name" value={provName} onChange={(e) => setProvName(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Provider NPI" value={provNpi} onChange={(e) => setProvNpi(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Phone" value={provPhone} onChange={(e) => setProvPhone(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Fax" value={provFax} onChange={(e) => setProvFax(e.target.value)} />
            </div>
          </div>

          {/* Patient Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input className="border rounded px-3 py-2" placeholder="Member ID (optional)" value={memberId} onChange={(e) => setMemberId(e.target.value)} />
              <select className="border rounded px-3 py-2" value={patientSex} onChange={(e) => setPatientSex(e.target.value as any)}>
                <option value="">Sex (optional)</option>
                <option value="F">F</option><option value="M">M</option>
                <option value="X">X</option><option value="U">U</option>
              </select>
              <div />
            </div>
          </div>

          {/* Appointment */}
          <div className="space-y-3">
            <h3 className="font-semibold">Appointment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="border rounded px-3 py-2" value={apptType} onChange={(e) => setApptType(e.target.value as AppointmentType)}>
                <option>Imaging</option><option>Office</option><option>Outpatient</option><option>Inpatient</option><option>Telehealth</option>
              </select>
              <input type="date" className="border rounded px-3 py-2" value={serviceDate} onChange={(e) => setServiceDate(e.target.value)} />
              <div />
            </div>
          </div>

          {/* Codes */}
          <div className="space-y-3">
            <h3 className="font-semibold">Codes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Primary CPT (optional)</label>
                <input className="w-full border rounded px-3 py-2" value={cpt} onChange={(e) => setCpt(e.target.value)} placeholder="70450" inputMode="numeric" maxLength={5} />
                {errors.cpt && <p className="text-sm text-red-600">{errors.cpt}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary ICD-10 (optional)</label>
                <input className="w-full border rounded px-3 py-2 uppercase" value={icd10} onChange={(e) => setIcd10(e.target.value)} placeholder="R51.9" />
                {errors.icd10 && <p className="text-sm text-red-600">{errors.icd10}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CPT List (comma-separated, optional)</label>
                <input className="w-full border rounded px-3 py-2" value={cptList} onChange={(e) => setCptList(e.target.value)} placeholder="70450, 72148" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">ICD-10 List (comma-separated, optional)</label>
                <input className="w-full border rounded px-3 py-2 uppercase" value={icdList} onChange={(e) => setIcdList(e.target.value)} placeholder="R51.9, M54.5" />
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-3">
            <h3 className="font-semibold">Attachments</h3>
            <input
              key={fileInputKey}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.tif,.tiff,.gif,.txt"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="block"
            />
            {files.length > 0 && (
              <ul className="text-sm text-gray-700 list-disc pl-5">
                {files.map((f) => (
                  <li key={f.name}>{f.name} • {(f.size / 1024).toFixed(0)} KB</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500">Max 10MB per file. Files are uploaded at submit.</p>
          </div>

          {/* Notes + Submit */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea className="w-full border rounded px-3 py-2" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Attach clinical justification, prior imaging, etc." />
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting} className="border rounded px-4 py-2 bg-black text-white disabled:opacity-60">
              {submitting ? "Submitting…" : "Submit Authorization"}
            </button>
          </div>
        </form>
      </section>

      {/* ===== Recent Submissions ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Recent Submissions</h2>
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
                <tr><td className="p-3 text-gray-600" colSpan={7}>No submissions yet.</td></tr>
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
                    {s.status}{s.etaDays ? ` • ETA ${s.etaDays}d` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Payer Directory ===== */}
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Payer Directory</h2>
        <PayerTable />
      </section>
    </div>
  );
}
