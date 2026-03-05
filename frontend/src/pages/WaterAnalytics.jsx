import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Droplet,
  CloudRain,
  ShieldAlert,
  RefreshCw,
  AlertCircle,
  Loader2,
  PieChart,
  Users,
} from "lucide-react";
import { getAnalyticsSummary, getAnalyticsTrends } from "../services/api";
import { ComplaintTrendChart, RiskDoughnut, WaterUsageChart } from "../components/Charts";
import IssueTypePieChart from "../components/IssueTypePieChart";

function MetricCard({ icon: Icon, label, value, sub, color }) {
  const colorMap = {
    cyan: "bg-brand-50 text-brand-600",
    red: "bg-red-50 text-red-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.cyan}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function WaterAnalytics() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([getAnalyticsSummary(), getAnalyticsTrends()])
      .then(([sumRes, trendRes]) => {
        setSummary(sumRes.data);
        setTrends(trendRes.data);
      })
      .catch(() => setError("Could not load analytics data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 size={24} className="text-brand-500" />
            Water &amp; Sanitation Analytics
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Data-driven insights for water management decisions
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                     bg-brand-600 text-white hover:bg-brand-700 transition"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={BarChart3} label="Total Complaints" value={trends?.total_complaints ?? 0} color="cyan" />
        <MetricCard
          icon={ShieldAlert}
          label="High Risk Areas"
          value={summary?.high_risk_areas ?? 0}
          color="red"
        />
        <MetricCard
          icon={CloudRain}
          label="Avg Rainfall"
          value={`${summary?.avg_rainfall ?? 0} mm`}
          color="blue"
        />
        <MetricCard
          icon={Droplet}
          label="Avg Water Usage"
          value={`${(summary?.avg_water_usage ?? 0).toLocaleString()} L`}
          color="cyan"
        />
        <MetricCard
          icon={Users}
          label="Avg Complaints / Area"
          value={summary?.avg_complaint_count ?? 0}
          color="amber"
        />
      </div>

      {/* Resolution stats */}
      {trends && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{trends.resolved_count}</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${trends.total_complaints ? (trends.resolved_count / trends.total_complaints * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Pending</p>
            <p className="text-3xl font-bold text-amber-600 mt-1">{trends.pending_count}</p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all"
                style={{ width: `${trends.total_complaints ? (trends.pending_count / trends.total_complaints * 100) : 0}%` }}
              />
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">In Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {trends.total_complaints - trends.resolved_count - trends.pending_count}
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-3">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    trends.total_complaints
                      ? ((trends.total_complaints - trends.resolved_count - trends.pending_count) / trends.total_complaints * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-600" />
            <h3 className="text-base font-semibold text-gray-800">Monthly Complaint Trends</h3>
          </div>
          {trends && <ComplaintTrendChart complaints={[]} monthData={trends.complaints_by_month} />}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className="text-brand-600" />
            <h3 className="text-base font-semibold text-gray-800">Issues by Type</h3>
          </div>
          {trends && <IssueTypePieChart data={trends.issues_by_type} />}
        </div>
      </div>

      {/* Water usage chart */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Droplet size={18} className="text-brand-600" />
          <h3 className="text-base font-semibold text-gray-800">Water Usage vs Rainfall</h3>
        </div>
        <WaterUsageChart summary={summary} />
      </div>

      {/* Risk distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} className="text-brand-600" />
            <h3 className="text-base font-semibold text-gray-800">Risk Distribution</h3>
          </div>
          <div className="w-48">
            <RiskDoughnut summary={summary} />
          </div>
        </div>
        <div className="lg:col-span-2 bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl border border-brand-100 p-6">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Decision Support Insights</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p><strong>Risk Alert:</strong> {summary?.high_risk_areas ?? 0} area(s) flagged as high risk for water shortage. Prioritize resource allocation.</p>
            </div>
            <div className="flex items-start gap-2">
              <CloudRain size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p><strong>Rainfall:</strong> Average {summary?.avg_rainfall ?? 0} mm across monitored areas. {(summary?.avg_rainfall ?? 0) < 40 ? "Below sustainable threshold — consider water conservation measures." : "Within normal range."}</p>
            </div>
            <div className="flex items-start gap-2">
              <Droplet size={16} className="text-brand-500 mt-0.5 shrink-0" />
              <p><strong>Water Demand:</strong> Average usage of {(summary?.avg_water_usage ?? 0).toLocaleString()} litres. {(summary?.avg_water_usage ?? 0) > 50000 ? "Consider demand-side management interventions." : "Usage within sustainable limits."}</p>
            </div>
            <div className="flex items-start gap-2">
              <TrendingUp size={16} className="text-amber-500 mt-0.5 shrink-0" />
              <p><strong>Complaint Hotspots:</strong> Average {summary?.avg_complaint_count ?? 0} complaints per area. {(summary?.avg_complaint_count ?? 0) > 30 ? "High complaint density — investigate infrastructure gaps." : "Moderate activity."}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
