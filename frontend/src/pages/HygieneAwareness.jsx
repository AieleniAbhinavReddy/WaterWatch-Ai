import React, { useEffect, useState } from "react";
import {
  Droplets,
  ShieldCheck,
  Sparkles,
  Heart,
  Loader2,
  BookOpen,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { getHygieneTips } from "../services/api";

const CATEGORY_META = {
  water_safety: {
    label: "Water Safety",
    icon: Droplets,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  sanitation: {
    label: "Sanitation",
    icon: ShieldCheck,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  hygiene: {
    label: "Hygiene",
    icon: Heart,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
};

export default function HygieneAwareness() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const fetchTips = () => {
    setLoading(true);
    setError(null);
    getHygieneTips()
      .then((res) => setTips(res.data))
      .catch(() => setError("Could not load hygiene content."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const filtered =
    activeCategory === "all"
      ? tips
      : tips.filter((t) => t.category === activeCategory);

  const categories = ["all", "water_safety", "sanitation", "hygiene"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles size={24} className="text-brand-500" />
            Hygiene &amp; Water Safety Awareness
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Learn best practices for water safety, sanitation, and personal hygiene — aligned with SDG 6.
          </p>
        </div>
        <button
          onClick={fetchTips}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
                     bg-brand-600 text-white hover:bg-brand-700 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SDG-6 banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <BookOpen size={28} />
          </div>
          <div>
            <h3 className="text-lg font-bold">SDG 6 — Clean Water & Sanitation</h3>
            <p className="text-sm text-brand-100 mt-1 leading-relaxed max-w-2xl">
              Ensure availability and sustainable management of water and sanitation for all.
              By 2030, achieve universal access to safe drinking water, adequate sanitation and hygiene,
              and reduce water pollution and water-related diseases.
            </p>
          </div>
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat];
          const label = meta?.label || "All Topics";
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                isActive
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-300 hover:text-brand-600"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-brand-500" />
        </div>
      )}

      {/* Tips grid */}
      {!loading && (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((tip) => {
            const meta = CATEGORY_META[tip.category] || CATEGORY_META.hygiene;
            const Icon = meta.icon;
            return (
              <div
                key={tip.id}
                className={`rounded-2xl border p-5 hover:shadow-md transition-shadow ${meta.color}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{tip.title}</h4>
                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                      {tip.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3" />
          <p className="font-medium">No tips found for this category.</p>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const count = tips.filter((t) => t.category === key).length;
          const Icon = meta.icon;
          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.badge}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-medium tracking-wide">{meta.label}</p>
                  <p className="text-xl font-bold text-gray-800">{count} tips</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
