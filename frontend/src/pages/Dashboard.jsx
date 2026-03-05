import React, { useEffect, useState } from "react";
import {
  MessageSquareWarning,
  ShieldAlert,
  CloudRain,
  Droplet,
  TrendingUp,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { getComplaints, getAnalyticsSummary, getWaterDataMonthly } from "../services/api";
import { ComplaintTrendChart, RiskDoughnut, WaterUsageChart } from "../components/Charts";
import MapView from "../components/MapView";
import ComplaintList from "../components/ComplaintList";

/* ---------- Stat Card ---------- */

function StatCard({ icon: Icon, label, value, color, loading }) {
  const colorMap = {
    cyan: "bg-brand-50 text-brand-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
  };
  const accent = colorMap[color] || colorMap.cyan;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {label}
          </p>
          {loading ? (
            <div className="h-8 w-20 bg-gray-100 rounded-lg mt-2 animate-shimmer" />
          ) : (
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Section Header ---------- */

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={18} className="text-brand-600" />
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    </div>
  );
}

/* ---------- Dashboard ---------- */

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([getComplaints(), getAnalyticsSummary(), getWaterDataMonthly()])
      .then(([compRes, sumRes, waterRes]) => {
        setComplaints(compRes.data);
        setSummary(sumRes.data);
        setWaterData(waterRes.data);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load dashboard data. Is the backend running?");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Overview
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor water & sanitation intelligence across regions
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                     bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={MessageSquareWarning}
          label="Total Complaints"
          value={summary?.total_complaints ?? 0}
          color="cyan"
          loading={loading}
        />
        <StatCard
          icon={ShieldAlert}
          label="High Risk Areas"
          value={summary?.high_risk_areas ?? 0}
          color="red"
          loading={loading}
        />
        <StatCard
          icon={CloudRain}
          label="Avg Rainfall (mm)"
          value={summary?.avg_rainfall ?? 0}
          color="blue"
          loading={loading}
        />
        <StatCard
          icon={Droplet}
          label="Avg Water Usage (L)"
          value={summary?.avg_water_usage ?? 0}
          color="emerald"
          loading={loading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <SectionHeader icon={TrendingUp} title="Complaint Trends" />
          <ComplaintTrendChart complaints={complaints} />
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center justify-center">
          <SectionHeader icon={ShieldAlert} title="Risk Distribution" />
          <div className="w-56 mt-2">
            <RiskDoughnut summary={summary} />
          </div>
        </div>
      </div>

      {/* Water usage chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <SectionHeader icon={Droplet} title="Water Usage Insights" />
        <WaterUsageChart summary={summary} waterData={waterData} />
      </div>

      {/* Map */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <SectionHeader icon={MapPin} title="Complaint Map" />
        <MapView complaints={complaints} />
      </div>

      {/* Recent complaints table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <SectionHeader icon={MessageSquareWarning} title="Recent Complaints" />
        <ComplaintList complaints={complaints} />
      </div>
    </div>
  );
}
