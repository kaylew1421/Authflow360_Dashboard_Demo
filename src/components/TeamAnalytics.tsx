import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

// Register only what's needed (NO datalabels)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TeamAnalytics: React.FC = () => {
  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];

  const issueSnapshot = {
    labels: ["Duplicate Claims", "Invalid/Missing Info", "Denials"],
    datasets: [
      {
        label: "Week 4",
        data: [11, 6, 19],
        backgroundColor: ["#facc15", "#60a5fa", "#f87171"],
        borderRadius: 4,
      },
    ],
  };

  const issueTrends = {
    labels: weeks,
    datasets: [
      {
        label: "Duplicate Claims",
        data: [12, 9, 14, 11],
        borderColor: "#facc15",
        backgroundColor: "#facc15",
        tension: 0.4,
      },
      {
        label: "Invalid/Missing Info",
        data: [7, 5, 8, 6],
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa",
        tension: 0.4,
      },
      {
        label: "Denials",
        data: [20, 18, 22, 19],
        borderColor: "#f87171",
        backgroundColor: "#f87171",
        tension: 0.4,
      },
    ],
  };

  const revenueChart = {
    labels: weeks,
    datasets: [
      {
        label: "Expected Revenue",
        data: [5000, 6000, 7000, 8000],
        borderColor: "#60a5fa",
        backgroundColor: "#60a5fa",
        borderDash: [5, 5],
        tension: 0.3,
      },
      {
        label: "Actual Revenue",
        data: [4800, 5800, 6600, 7500],
        borderColor: "#4ade80",
        backgroundColor: "#4ade80",
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: true,
      },
      datalabels: {
        display: false, // 🔥 Turn off inline labels completely
      },
      legend: {
        position: "bottom" as const,
        labels: {
          font: { size: 10 },
        },
      },
    },
    scales: {
      y: {
        ticks: { font: { size: 10 } },
        beginAtZero: true,
      },
      x: {
        ticks: { font: { size: 10 } },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow-md space-y-6">
      <h2 className="text-lg font-bold text-gray-800 mb-2">📈 Analytics Overview</h2>

      {/* Week Snapshot */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-700">Team Snapshot: Week 4</h3>
        <div className="h-48">
          <Bar data={issueSnapshot} options={chartOptions} />
        </div>
      </div>

      {/* Weekly Trends */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-700">Issue Trends Over 4 Weeks</h3>
        <div className="h-48">
          <Line data={issueTrends} options={chartOptions} />
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-gray-700">Expected vs Actual Revenue</h3>
        <div className="h-48">
          <Line data={revenueChart} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;
