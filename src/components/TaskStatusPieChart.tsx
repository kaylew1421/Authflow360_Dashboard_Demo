import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register elements & plugins
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const TaskStatusPieChart = () => {
  const data = {
    labels: ["In Progress", "Complete", "Not Started", "Overdue"],
    datasets: [
      {
        label: "Task Status",
        data: [2, 2, 2, 2], // You can replace this with dynamic state later
        backgroundColor: ["#facc15", "#4ade80", "#60a5fa", "#f87171"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        color: "#fff",
        formatter: (value: number, context: any) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (acc: number, curr: number) => acc + curr,
            0
          );
          const percent = ((value / total) * 100).toFixed(1);
          return `${percent}%`;
        },
        font: {
          weight: "bold" as const,
          size: 14,
        },
      },
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 15,
          boxWidth: 15,
        },
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded shadow-md min-h-[500px] flex flex-col justify-between">
      <h2 className="text-lg font-bold mb-2">Task Status Overview</h2>
      <Pie data={data} options={options} />
    </div>
  );
};

export default TaskStatusPieChart;
