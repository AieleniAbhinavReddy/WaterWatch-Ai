import React, { useState } from "react";
import {
  Leaf,
  Loader2,
  Droplets,
  CloudRain,
  Users,
  Calendar,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Gauge,
} from "lucide-react";
import { getConservationRecommendations } from "../services/api";

const FIELDS = [
  { name: "area_name", label: "Area / Region Name", placeholder: "e.g. Hyderabad Zone-3", icon: Leaf, type: "text" },
  { name: "rainfall", label: "Rainfall (mm)", placeholder: "e.g. 35", icon: CloudRain, type: "number" },
  { name: "population", label: "Population", placeholder: "e.g. 80000", icon: Users, type: "number" },
  { name: "water_usage", label: "Water Usage (litres)", placeholder: "e.g. 60000", icon: Droplets, type: "number" },
  { name: "month", label: "Month (1–12)", placeholder: "e.g. 5", icon: Calendar, type: "number" },
];

const PRIORITY_STYLES = {
  Urgent: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-500" },
  High: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500" },
  Standard: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-500" },
};

export default function WaterConservation() {
  const [form, setForm] = useState({
    area_name: "", rainfall: "", population: "", water_usage: "", month: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const payload = {
        area_name: form.area_name,
        rainfall: parseFloat(form.rainfall),
        population: parseInt(form.population, 10),
        water_usage: parseFloat(form.water_usage),
        month: parseInt(form.month, 10),
      };
      const res = await getConservationRecommendations(payload);
      setResult(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Failed to generate recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const style = result ? (PRIORITY_STYLES[result.priority] || PRIORITY_STYLES.Standard) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Leaf size={24} className="text-green-600" />
          Water Conservation AI
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Get AI-powered conservation recommendations tailored to your region's conditions
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          {FIELDS.map(({ name, label, placeholder, icon: Icon, type }) => (
            <div key={name} className={name === "area_name" ? "sm:col-span-2" : ""}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Icon size={14} className="text-green-500" />
                {label}
              </label>
              <input
                name={name}
                type={type}
                step={type === "number" ? "any" : undefined}
                required
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none
                           placeholder-gray-400 transition"
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3
                     rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Analyzing…</>
          ) : (
            <><Leaf size={16} /> Generate Recommendations</>
          )}
        </button>

        {error && <p className="text-sm text-center text-red-600">{error}</p>}
      </form>

      {/* Results */}
      {result && style && (
        <div className="space-y-6">
          {/* Score cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className={`${style.bg} border ${style.border} rounded-2xl p-5 text-center`}>
              <Gauge size={24} className={`mx-auto ${style.text}`} />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">
                Efficiency Score
              </p>
              <p className={`text-3xl font-bold mt-1 ${style.text}`}>
                {result.water_efficiency_score}
              </p>
              <p className="text-xs text-gray-500">out of 100</p>
            </div>
            <div className={`${style.bg} border ${style.border} rounded-2xl p-5 text-center`}>
              <AlertTriangle size={24} className={`mx-auto ${style.text}`} />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">
                Risk Category
              </p>
              <p className={`text-xl font-bold mt-1 ${style.text}`}>
                {result.risk_category}
              </p>
              <span className={`inline-block mt-1 px-3 py-0.5 rounded-full text-white text-xs font-bold ${style.badge}`}>
                {result.priority} Priority
              </span>
            </div>
            <div className={`${style.bg} border ${style.border} rounded-2xl p-5 text-center`}>
              <TrendingDown size={24} className={`mx-auto ${style.text}`} />
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-2">
                Potential Savings
              </p>
              <p className={`text-3xl font-bold mt-1 ${style.text}`}>
                {result.potential_savings_pct}%
              </p>
              <p className="text-xs text-gray-500">water reduction possible</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-green-600" />
              AI Recommendations for {result.area_name}
            </h3>
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
