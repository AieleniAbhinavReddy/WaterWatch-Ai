import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/* ---------- Complaint-trend bar chart ---------- */

export function ComplaintTrendChart({ complaints = [], monthData }) {
  const counts = new Array(12).fill(0);
  if (monthData && monthData.length === 12) {
    monthData.forEach((m, i) => { counts[i] = m.count; });
  } else {
    complaints.forEach((c) => {
      const m = new Date(c.created_at).getMonth();
      counts[m] += 1;
    });
  }

  const data = {
    labels: MONTHS,
    datasets: [
      {
        label: "Complaints",
        data: counts,
        backgroundColor: "rgba(6,182,212,0.8)",
        hoverBackgroundColor: "rgba(6,182,212,1)",
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0, color: "#94a3b8", font: { size: 11 } },
        grid: { color: "#f1f5f9" },
      },
      x: {
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return <Bar data={data} options={options} />;
}

/* ---------- Risk analytics doughnut ---------- */

export function RiskDoughnut({ summary }) {
  if (!summary) return <p className="text-sm text-gray-400">No data</p>;

  const highRisk = summary.high_risk_areas || 0;
  const normal = Math.max((summary.total_complaints || 0) - highRisk, 0);

  const data = {
    labels: ["High Risk", "Normal"],
    datasets: [
      {
        data: [highRisk, normal || 1],        // at least 1 so doughnut renders
        backgroundColor: ["#ef4444", "#22d3ee"],
        hoverBackgroundColor: ["#dc2626", "#06b6d4"],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, padding: 16, font: { size: 12 } },
      },
      title: { display: false },
    },
  };

  return <Doughnut data={data} options={options} />;
}

/* ---------- Water Usage Insights (area / line chart) ---------- */

export function WaterUsageChart({ summary }) {
  // Provide a sample visualization even if summary is minimal
  const avgUsage = summary?.avg_water_usage || 0;
  const avgRainfall = summary?.avg_rainfall || 0;

  // Simulated monthly data proportional to averages (for demo purposes)
  const usageData = MONTHS.map((_, i) => Math.round(avgUsage * (0.7 + Math.sin(i) * 0.3)));
  const rainfallData = MONTHS.map((_, i) => Math.round(avgRainfall * (0.5 + Math.cos(i + 1) * 0.5)));

  const data = {
    labels: MONTHS,
    datasets: [
      {
        label: "Water Usage (L)",
        data: usageData,
        borderColor: "#06b6d4",
        backgroundColor: "rgba(6,182,212,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#06b6d4",
      },
      {
        label: "Rainfall (mm)",
        data: rainfallData,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.08)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#6366f1",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { color: "#f1f5f9" },
      },
      x: {
        ticks: { color: "#94a3b8", font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return <Line data={data} options={options} />;
}
