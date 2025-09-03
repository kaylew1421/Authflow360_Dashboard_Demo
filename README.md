### Live @: https://authflow360-dashboard-demo.vercel.app/

# AuthFlow360 Dashboard Demo

A demo dashboard for **AuthFlow360** – a healthcare technology platform designed to streamline the prior authorization process for providers.  
This project is a **React + Vite + TypeScript** front-end with simple **mock API routes** hosted on Vercel (`/api/payers` and `/api/submissions`) for demo purposes.

---

## 🚀 Features

### Authorization Workflow
- Create and submit **prior authorization requests** via a clean, modern UI.
- Capture:
  - Patient demographics
  - Provider details
  - Appointment info (date, type)
  - Codes (CPT, ICD-10, multi-list support)
  - Attachments (uploaded files)
  - Notes and urgency level
- Real-time validation of required fields (DOB, Patient Name, CPT formatting, etc.).

### Payer Directory
- Browse a list of payers, plans, turnaround times, and prior authorization requirements.
- Payers loaded from `/api/payers` (currently mocked dataset).

### Submissions Table
- View recent authorization submissions in a table.
- Shows status, urgency, turnaround estimates, and timestamps.
- Submissions are stored in memory (mock) via `/api/submissions`.

### Dashboard Layout
- **Sidebar navigation** with sections:
  - Authorizations
  - Search & Status
  - Clients / Clinics
  - Compliance / Logs
  - Admin
  - Settings
- Responsive, styled with Tailwind CSS.

---

## 🛠️ Tech Stack

- **Frontend**
  - [React](https://react.dev/) (with Hooks, useState/useEffect/useMemo)
  - [Vite](https://vitejs.dev/) for fast builds
  - [TypeScript](https://www.typescriptlang.org/)
  - [Tailwind CSS](https://tailwindcss.com/) for styling

- **APIs (Serverless on Vercel)**
  - **Node.js runtime**
  - `api/payers.js` → mock payer directory
  - `api/submissions.js` → in-memory submissions handler

- **Hosting**
  - [Vercel](https://vercel.com/)

---



## ⚙️ Getting Started
- Node.js 18+

- Prerequisites

- npm or yarn

1. Clone the repo
git clone https://github.com/kaylew1421/Authflow360_Dashboard_Demo.git
cd Authflow360_Dashboard_Demo

2. Install dependencies
npm install

3. Run locally
npm run dev


Visit: http://localhost:5173

4. Build for production
npm run build
npm run preview

🔗 API Endpoints

#### All API routes live under /api.

#### GET /api/payers

#### Returns mock payer data.

{
  "ok": true,
  "items": [
    {
      "id": "bcbs-tx",
      "name": "Blue Cross Blue Shield of Texas",
      "states": ["TX"],
      "plans": ["PPO", "HMO"],
      "auth_required": true,
      "turnaround_days": 3
    }
  ]
}

#### GET /api/submissions

#### Returns recent mock submissions.

{ "ok": true, "items": [] }

#### POST /api/submissions

#### Accepts a new submission payload.

{
  "ok": true,
  "record": {
    "id": "1693859100000-ab12cd",
    "patientName": "Jane Doe",
    "dob": "1980-01-01",
    "payerId": "bcbs-tx",
    "urgency": "Routine"
  }
}

## 📸 Screenshots
- Authorizations Form

- Payer Directory

## 🧭 Roadmap

- Replace mock APIs with Neon/Postgres backend

- Authentication & role-based access

- Audit & compliance logs

- File storage integration (S3/Blob)

- Production-ready analytics dashboards

## 🤝 Contributing

PRs welcome!
For larger features, please open an issue first to discuss.

## 📂 Project Structure

```plaintext
authflow360-dashboard-demo/
├─ api/                 # Serverless API endpoints
│  ├─ payers.js         # Mock payer directory (GET)
│  └─ submissions.js    # Mock submissions (GET, POST)
├─ public/              # Static assets (favicon, etc.)
├─ src/
│  ├─ components/       # UI components (PayerTable, etc.)
│  ├─ hooks/            # Custom hooks (e.g., usePayers)
│  ├─ pages/
│  │  └─ Authorizations.tsx # Main authorizations form & dashboard
│  ├─ lib/              # Shared utilities
│  └─ main.tsx          # App entry point
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
