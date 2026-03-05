import React, { useState } from "react";
import {
  Activity,
  Gauge,
  Loader2,
  CloudRain,
  Users,
  Droplet,
  MessageSquareWarning,
  Calendar,
} from "lucide-react";
import { predictRisk } from "../services/api";

/* ---------- Risk result styling map (avoids dynamic Tailwind classes) ---------- */

const RISK_STYLES = {
  High: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    ring: "ring-red-500",
    badge: "bg-red-500",
  },
  Medium: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-600",
    ring: "ring-yellow-500",
    badge: "bg-yellow-500",
  },
  Low: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    ring: "ring-green-500",
    badge: "bg-green-500",
  },
};

const FIELDS = [
  { name: "rainfall", label: "Rainfall (mm)", placeholder: "e.g. 50", icon: CloudRain },
  { name: "population", label: "Population", placeholder: "e.g. 80000", icon: Users },
  { name: "water_usage", label: "Water Usage (litres)", placeholder: "e.g. 60000", icon: Droplet },
  { name: "complaint_count", label: "Complaint Count", placeholder: "e.g. 30", icon: MessageSquareWarning },
  { name: "month", label: "Month (1–12)", placeholder: "e.g. 6", icon: Calendar },
];

export default function RiskPrediction() {
  const [form, setForm] = useState({
    rainfall: "",
    population: "",
    water_usage: "",
    complaint_count: "",
    month: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const payload = {
        rainfall: parseFloat(form.rainfall),
        population: parseInt(form.population, 10),
        water_usage: parseFloat(form.water_usage),
        complaint_count: parseInt(form.complaint_count, 10),
        month: parseInt(form.month, 10),
      };
      const res = await predictRisk(payload);
      setResult(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Prediction failed. Check inputs or try again.");
    } finally {
      setLoading(false);
    }
  };

  const style = result ? RISK_STYLES[result.risk_level] || RISK_STYLES.Low : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Water Shortage Risk Prediction
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter area data to predict the water shortage risk level using our AI model.
        </p>
      </div>

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(({ name, label, placeholder, icon: Icon }) => (
            <div key={name} className={name === "month" ? "sm:col-span-2 sm:max-w-[50%]" : ""}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Icon size={14} className="text-brand-500" />
                {label}
              </label>
              <input
                name={name}
                type="number"
                step="any"
                required
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none
                           placeholder-gray-400 transition"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3
                     rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Analyzing…
            </>
          ) : (
            <>
              <Activity size={16} /> Predict Risk
            </>
          )}
        </button>

        {error && (
          <p className="text-sm text-center text-red-600">{error}</p>
        )}
      </form>

      {/* Result card */}
      {result && style && (
        <div
          className={`${style.bg} border ${style.border} rounded-2xl p-8 text-center space-y-4`}
        >
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-full ${style.badge} flex items-center justify-center shadow-lg`}>
              <Gauge size={36} className="text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Predicted Risk Level
            </p>
            <p className={`text-4xl font-extrabold mt-1 ${style.text}`}>
              {result.risk_level}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full shadow-sm">
            <span className="text-sm text-gray-600">Risk Score:</span>
            <span className={`text-lg font-bold ${style.text}`}>
              {(result.risk_score * 100).toFixed(1)}%
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Powered by RandomForest AI Model
          </p>
        </div>
      )}
    </div>
  );
}
