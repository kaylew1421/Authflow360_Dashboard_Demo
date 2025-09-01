import { useState } from "react";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="section-title">{children}</h2>
);

const AuthorizationForm = () => {
  const [submission, setSubmission] = useState({ issuer: '', fax: '', phone: '', date: '' });
  const [patient, setPatient] = useState({ name: '', dob: '', gender: '', id: '' });
  const [provider, setProvider] = useState({ name: '', npi: '', phone: '', fax: '' });
  const [serviceRows, setServiceRows] = useState([{ cpt: '', icd: '', start: '', end: '' }]);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  const handleServiceChange = (index: number, field: string, value: string) => {
    const updated = [...serviceRows];
    updated[index][field as keyof typeof serviceRows[0]] = value;
    setServiceRows(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      submission,
      patient,
      provider,
      services: serviceRows,
      clinicalNotes,
      attachmentName: attachment?.name || null,
    };
    console.log("Simulated Submission:", payload);
    alert("Authorization submitted!");
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <SectionTitle>Submission</SectionTitle>
        <div className="form-section">
          <input placeholder="Payer / Issuer" value={submission.issuer} onChange={(e) => setSubmission({ ...submission, issuer: e.target.value })} />
          <input placeholder="Fax Number" value={submission.fax} onChange={(e) => setSubmission({ ...submission, fax: e.target.value })} />
          <input placeholder="Phone Number" value={submission.phone} onChange={(e) => setSubmission({ ...submission, phone: e.target.value })} />
          <input type="date" placeholder="Submission Date" value={submission.date} onChange={(e) => setSubmission({ ...submission, date: e.target.value })} />
        </div>

        <SectionTitle>Patient Info</SectionTitle>
        <div className="form-section">
          <input placeholder="Full Name" value={patient.name} onChange={(e) => setPatient({ ...patient, name: e.target.value })} />
          <input type="date" placeholder="DOB" value={patient.dob} onChange={(e) => setPatient({ ...patient, dob: e.target.value })} />
          <input placeholder="Gender" value={patient.gender} onChange={(e) => setPatient({ ...patient, gender: e.target.value })} />
          <input placeholder="Patient ID" value={patient.id} onChange={(e) => setPatient({ ...patient, id: e.target.value })} />
        </div>

        <SectionTitle>Provider Info</SectionTitle>
        <div className="form-section">
          <input placeholder="Provider Name" value={provider.name} onChange={(e) => setProvider({ ...provider, name: e.target.value })} />
          <input placeholder="NPI Number" value={provider.npi} onChange={(e) => setProvider({ ...provider, npi: e.target.value })} />
          <input placeholder="Phone" value={provider.phone} onChange={(e) => setProvider({ ...provider, phone: e.target.value })} />
          <input placeholder="Fax" value={provider.fax} onChange={(e) => setProvider({ ...provider, fax: e.target.value })} />
        </div>

        <SectionTitle>Services Requested</SectionTitle>
        {serviceRows.map((r, i) => (
          <div className="form-row" key={i}>
            <input placeholder="CPT Code" value={r.cpt} onChange={(e) => handleServiceChange(i, "cpt", e.target.value)} />
            <input placeholder="ICD Code" value={r.icd} onChange={(e) => handleServiceChange(i, "icd", e.target.value)} />
            <input type="date" placeholder="Start Date" value={r.start} onChange={(e) => handleServiceChange(i, "start", e.target.value)} />
            <input type="date" placeholder="End Date" value={r.end} onChange={(e) => handleServiceChange(i, "end", e.target.value)} />
          </div>
        ))}

        <button
          type="button"
          className="button-secondary mt-2"
          onClick={() => setServiceRows([...serviceRows, { cpt: '', icd: '', start: '', end: '' }])}
        >
          + Add Another Service
        </button>

        <SectionTitle>Clinical Notes</SectionTitle>
        <textarea
          placeholder="Enter relevant clinical notes here..."
          value={clinicalNotes}
          onChange={(e) => setClinicalNotes(e.target.value)}
          className="w-full mt-2 mb-2"
          rows={4}
        />

        <label className="block mb-4">
          <span className="text-sm font-medium text-gray-700">Attach Supporting Document (optional)</span>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
            className="mt-1 block"
          />
        </label>

        {attachment && (
          <div className="attachment-preview">
            📎 Attached: {attachment.name}
          </div>
        )}

        <button type="submit" className="button mt-6">Submit Authorization</button>
      </form>
    </div>
  );
};

export default AuthorizationForm;
