import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const COLORS = [
  "#06b6d4", "#ef4444", "#f59e0b", "#22c55e", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f97316", "#6366f1", "#84cc16",
];

export default function IssueTypePieChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No issue type data available.</p>;
  }

  const chartData = {
    labels: data.map((d) => d.issue_type),
    datasets: [
      {
        data: data.map((d) => d.count),
        backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "55%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="max-w-xs mx-auto">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
