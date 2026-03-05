import React, { useState } from "react";
import {
  FlaskConical,
  Loader2,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Droplet,
} from "lucide-react";
import { analyzeWaterQuality } from "../services/api";

const FIELDS = [
  { name: "ph", label: "pH Level", placeholder: "e.g. 7.2", icon: FlaskConical, hint: "Safe: 6.5–8.5" },
  { name: "turbidity", label: "Turbidity (NTU)", placeholder: "e.g. 3.5", icon: Droplet, hint: "Safe: <5 NTU" },
  { name: "dissolved_oxygen", label: "Dissolved Oxygen (mg/L)", placeholder: "e.g. 6.0", icon: Droplet, hint: "Safe: >5 mg/L" },
  { name: "conductivity", label: "Conductivity (µS/cm)", placeholder: "e.g. 450", icon: Gauge, hint: "Safe: <1000 µS/cm" },
  { name: "temperature", label: "Temperature (°C)", placeholder: "e.g. 22", icon: Thermometer, hint: "Ideal: 15–25°C" },
  { name: "total_dissolved_solids", label: "TDS (mg/L)", placeholder: "e.g. 280", icon: FlaskConical, hint: "Safe: <500 mg/L" },
];

const QUALITY_STYLES = {
  Excellent: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-500", ring: "ring-emerald-400" },
  Good: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-500", ring: "ring-green-400" },
  Fair: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500", ring: "ring-amber-400" },
  Poor: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-500", ring: "ring-orange-400" },
  Hazardous: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", badge: "bg-red-500", ring: "ring-red-400" },
};

const STATUS_COLORS = {
  Good: "text-green-600 bg-green-50",
  Acceptable: "text-amber-600 bg-amber-50",
  Poor: "text-red-600 bg-red-50",
};

export default function WaterQualityRisk() {
  const [form, setForm] = useState({
    ph: "", turbidity: "", dissolved_oxygen: "",
    conductivity: "", temperature: "", total_dissolved_solids: "",
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
      const payload = {};
      for (const f of FIELDS) {
        payload[f.name] = parseFloat(form[f.name]);
      }
      const res = await analyzeWaterQuality(payload);
      setResult(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Water quality analysis failed. Check inputs.");
    } finally {
      setLoading(false);
    }
  };

  const style = result ? (QUALITY_STYLES[result.overall_quality] || QUALITY_STYLES.Fair) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FlaskConical size={24} className="text-blue-600" />
          Water Quality Risk Prediction
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Analyze water quality parameters against WHO / IS 10500 standards
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FIELDS.map(({ name, label, placeholder, icon: Icon, hint }) => (
            <div key={name}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Icon size={14} className="text-blue-500" />
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
                           focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none
                           placeholder-gray-400 transition"
                placeholder={placeholder}
              />
              <p className="text-[11px] text-gray-400 mt-1">{hint}</p>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3
                     rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 size={18} className="animate-spin" /> Analyzing…</>
          ) : (
            <><FlaskConical size={16} /> Analyze Water Quality</>
          )}
        </button>

        {error && <p className="text-sm text-center text-red-600">{error}</p>}
      </form>

      {/* Results */}
      {result && style && (
        <div className="space-y-6">
          {/* Overall quality card */}
          <div className={`${style.bg} border ${style.border} rounded-2xl p-8 text-center`}>
            <div className="flex justify-center">
              <div className={`w-24 h-24 rounded-full ${style.badge} flex items-center justify-center shadow-lg`}>
                <span className="text-3xl font-bold text-white">{result.quality_score}</span>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mt-4">
              Overall Water Quality
            </p>
            <p className={`text-4xl font-extrabold mt-1 ${style.text}`}>
              {result.overall_quality}
            </p>
            <p className="text-sm text-gray-500 mt-1">Score: {result.quality_score} / 100</p>
          </div>

          {/* Parameter breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Gauge size={20} className="text-blue-600" />
              Parameter Analysis
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(result.parameters).map(([key, param]) => (
                <div
                  key={key}
                  className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[param.status] || ""}`}>
                      {param.status}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {param.value} <span className="text-sm font-normal text-gray-400">{param.unit}</span>
                  </p>
                  {/* Score bar */}
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        param.score >= 70 ? "bg-green-500" : param.score >= 40 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${param.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">Score: {param.score}/100</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Recommendations */}
          {result.risks.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={20} />
                Identified Risks
              </h3>
              <ul className="space-y-2">
                {result.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle2 size={20} className="text-blue-600" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {result.recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
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
