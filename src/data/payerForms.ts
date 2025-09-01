export const payerForms = {
  BCBS: [
    { label: "Member ID", name: "memberId", type: "text", required: true },
    { label: "Date of Birth", name: "dob", type: "date", required: true },
    { label: "CPT Code", name: "cptCode", type: "text", required: true }
  ],
  Aetna: [
    { label: "Patient Name", name: "patientName", type: "text", required: true },
    { label: "NPI Number", name: "npi", type: "text", required: true },
    { label: "Diagnosis Code", name: "dxCode", type: "text", required: false }
  ],
  Medicare: [
    { label: "Medicare ID", name: "medicareId", type: "text", required: true },
    { label: "Service Type", name: "serviceType", type: "text", required: true }
  ]
};
