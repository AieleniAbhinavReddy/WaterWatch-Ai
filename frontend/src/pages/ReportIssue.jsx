import React, { useState } from "react";
import {
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  MapPin,
  FileText,
  Type,
  Loader2,
  Tag,
} from "lucide-react";
import { createComplaint } from "../services/api";

const ISSUE_TYPES = [
  "Water Contamination",
  "Water Shortage",
  "Pipeline Leakage",
  "Sanitation Failure",
  "Sewage Overflow",
  "Other",
];

export default function ReportIssue() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    issue_type: "Other",
    latitude: "",
    longitude: "",
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const payload = {
        title: form.title,
        description: form.description || null,
        issue_type: form.issue_type,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      };
      await createComplaint(payload);
      setStatus({ ok: true, msg: "Complaint submitted successfully!" });
      setForm({ title: "", description: "", issue_type: "Other", latitude: "", longitude: "" });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setStatus({
        ok: false,
        msg: typeof detail === "string" ? detail : "Failed to submit complaint.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Help improve water &amp; sanitation services by reporting a problem in your area.
        </p>
      </div>

      {/* Status banner */}
      {status && (
        <div
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
            status.ok
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {status.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {status.msg}
        </div>
      )}

      {/* Form card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100"
      >
        {/* Title */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Type size={14} /> Title <span className="text-red-400">*</span>
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none
                       placeholder-gray-400 transition"
            placeholder="e.g. Broken pipe on Main Street"
          />
        </div>

        {/* Issue Type */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Tag size={14} /> Issue Type <span className="text-red-400">*</span>
          </label>
          <select
            name="issue_type"
            value={form.issue_type}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none
                       transition bg-white"
          >
            {ISSUE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <FileText size={14} /> Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                       focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none
                       placeholder-gray-400 transition resize-none"
            placeholder="Describe the problem in detail…"
          />
        </div>

        {/* Location */}
        <div className="p-5">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <MapPin size={14} /> Location Coordinates
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none
                           placeholder-gray-400 transition"
                placeholder="e.g. 28.6139"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm
                           focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none
                           placeholder-gray-400 transition"
                placeholder="e.g. 77.2090"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-5">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-3
                       rounded-xl font-semibold hover:bg-brand-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send size={16} /> Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info card */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold">Tips for a good report</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-700">
            <li>Use a clear, specific title</li>
            <li>Include the exact location if possible</li>
            <li>Describe what you observed and when</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
