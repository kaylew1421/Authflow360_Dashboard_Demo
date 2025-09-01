// src/components/Announcements.tsx
import React from "react";

const announcements = [
  {
    title: "Town Hall Scheduled for August 2nd",
    date: "July 20, 2025",
    message: "Join us for the quarterly Town Hall where we’ll review performance, discuss team wins, and unveil new features rolling out next month.",
  },
  {
    title: "New HIPAA Compliance Training Deadline",
    date: "July 18, 2025",
    message: "All team members must complete the updated HIPAA compliance module in the LMS by July 31st. This is mandatory for all roles.",
  },
  {
    title: "Shoutout: Prior Auth Team Hits 98% Accuracy!",
    date: "July 15, 2025",
    message: "Huge kudos to the Prior Authorization team for achieving a 98% accuracy rate on Q2 audits — an all-time high for AuthFlow360!",
  },
];

const Announcements: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded shadow-md space-y-4">
      <h2 className="text-lg font-bold text-gray-800 mb-2">📢 Company Announcements</h2>

      {announcements.map((item, index) => (
        <div key={index} className="border-b pb-4">
          <p className="text-xs text-gray-400">{item.date}</p>
          <h3 className="text-md font-semibold text-gray-700 mt-1">{item.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{item.message}</p>
        </div>
      ))}

      <p className="text-xs text-gray-400 italic pt-2">Last updated: {announcements[0].date}</p>
    </div>
  );
};

export default Announcements;
