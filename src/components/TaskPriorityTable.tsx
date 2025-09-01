import React from "react";

const TaskPriorityTable = () => {
  const data = [
    { priority: "High", count: 4, percent: "50.0%" },
    { priority: "Medium", count: 2, percent: "25.0%" },
    { priority: "Low", count: 2, percent: "25.0%" },
  ];

  // Badge color mapping
  const getBadgeClass = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-600";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md min-h-[500px] flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-bold mb-4">Task Priority Summary</h2>
        <table className="w-full text-sm text-left border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-2 border">Priority</th>
              <th className="px-4 py-2 border text-center">Count</th>
              <th className="px-4 py-2 border text-center">Percent</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.priority}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
              >
                <td className="px-4 py-2 border">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getBadgeClass(
                      row.priority
                    )}`}
                  >
                    {row.priority}
                  </span>
                </td>
                <td className="px-4 py-2 border text-center">{row.count}</td>
                <td className="px-4 py-2 border text-center">{row.percent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskPriorityTable;
