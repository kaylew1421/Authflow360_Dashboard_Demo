// src/components/DailyAssignments.tsx
import React from "react";

const tasks = [
  {
    description: "Follow up on denied claim",
    assignedBy: "Manager",
    priority: "High",
    status: "In Progress",
  },
  {
    description: "Fax medical records",
    assignedBy: "Supervisor",
    priority: "Low",
    status: "Not Started",
  },
  {
    description: "Appeal request for John Doe",
    assignedBy: "Team Lead",
    priority: "High",
    status: "Overdue",
  },
  {
    description: "Upload radiology report",
    assignedBy: "Dr. Lee",
    priority: "Medium",
    status: "Complete",
  },
];

// Styling helpers
const priorityBadge = {
  High: "bg-red-100 text-red-600",
  Medium: "bg-yellow-100 text-yellow-600",
  Low: "bg-green-100 text-green-600",
};

const statusBadge = {
  "Not Started": "bg-gray-100 text-gray-600",
  "In Progress": "bg-blue-100 text-blue-600",
  Complete: "bg-green-100 text-green-600",
  Overdue: "bg-red-100 text-red-600",
};

const DailyAssignments: React.FC = () => {
  return (
    <div className="bg-white p-4 rounded shadow-md mb-6">
      <h2 className="text-lg font-bold mb-4">📋 Daily Assignments</h2>
      <table className="w-full text-sm text-left border border-gray-200 rounded overflow-hidden">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="px-3 py-2 border">Description</th>
            <th className="px-3 py-2 border">Assigned By</th>
            <th className="px-3 py-2 border">Priority</th>
            <th className="px-3 py-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
            >
              <td className="px-3 py-2 border">{task.description}</td>
              <td className="px-3 py-2 border">{task.assignedBy}</td>
              <td className="px-3 py-2 border">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    priorityBadge[task.priority as keyof typeof priorityBadge]
                  }`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="px-3 py-2 border">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    statusBadge[task.status as keyof typeof statusBadge]
                  }`}
                >
                  {task.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DailyAssignments;
