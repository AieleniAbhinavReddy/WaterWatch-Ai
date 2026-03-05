import React, { useEffect, useState } from "react";
import {
  Shield,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRightCircle,
  MapPin,
  Filter,
  BarChart3,
  Search,
} from "lucide-react";
import { getComplaints, updateComplaintStatus, getAnalyticsTrends } from "../services/api";
import MapView from "../components/MapView";

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"];
const STATUS_STYLES = {
  Pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock },
  "In Progress": { bg: "bg-blue-100", text: "text-blue-700", icon: ArrowRightCircle },
  Resolved: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
};

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = () => {
    setLoading(true);
    setError(null);
    Promise.all([getComplaints(), getAnalyticsTrends()])
      .then(([compRes, trendRes]) => {
        setComplaints(compRes.data);
        setTrends(trendRes.data);
      })
      .catch(() => setError("Could not load admin data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateComplaintStatus(id, newStatus);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      );
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const issueTypes = [...new Set(complaints.map((c) => c.issue_type || "Other"))];

  const filtered = complaints.filter((c) => {
    if (filterStatus !== "all" && c.status !== filterStatus) return false;
    if (filterType !== "all" && (c.issue_type || "Other") !== filterType) return false;
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const statusCounts = {
    Pending: complaints.filter((c) => c.status === "Pending").length,
    "In Progress": complaints.filter((c) => c.status === "In Progress").length,
    Resolved: complaints.filter((c) => c.status === "Resolved").length,
  };

  // Sanitation-related complaints for clustering
  const sanitationComplaints = complaints.filter((c) =>
    ["Sanitation Failure", "Sewage Overflow"].includes(c.issue_type)
  );

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
            <Shield size={24} className="text-brand-500" />
            Admin Panel
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage complaints, update statuses, and monitor sanitation clusters.
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

      {/* Summary cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase">Total</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{complaints.length}</p>
        </div>
        {STATUS_OPTIONS.map((s) => {
          const style = STATUS_STYLES[s];
          const Icon = style.icon;
          return (
            <div key={s} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2">
                <Icon size={16} className={style.text} />
                <p className="text-xs font-medium text-gray-400 uppercase">{s}</p>
              </div>
              <p className={`text-3xl font-bold mt-1 ${style.text}`}>{statusCounts[s]}</p>
            </div>
          );
        })}
      </div>

      {/* Sanitation cluster map */}
      {sanitationComplaints.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-red-500" />
            <h3 className="text-base font-semibold text-gray-800">
              Sanitation Problem Clusters ({sanitationComplaints.length} issues)
            </h3>
          </div>
          <MapView complaints={sanitationComplaints} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={16} className="text-gray-500" />
          <span className="text-sm font-semibold text-gray-700">Filters</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center bg-gray-50 rounded-lg px-3 py-2 gap-2">
            <Search size={14} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent outline-none text-sm w-48 placeholder-gray-400"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand-400"
          >
            <option value="all">All Issue Types</option>
            {issueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints table with status controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Title</th>
                <th className="px-4 py-3 text-left font-semibold">Type</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Description</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Location</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No complaints match the current filters.
                  </td>
                </tr>
              )}
              {filtered.map((c) => {
                const st = STATUS_STYLES[c.status] || STATUS_STYLES.Pending;
                return (
                  <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[200px] truncate">
                      {c.title}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {c.issue_type || "Other"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-xs hidden md:table-cell">
                      {c.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                      {c.latitude && c.longitude
                        ? `${c.latitude.toFixed(4)}, ${c.longitude.toFixed(4)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={c.status}
                        disabled={updatingId === c.id}
                        onChange={(e) => handleStatusChange(c.id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-brand-400 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue type breakdown */}
      {trends && trends.issues_by_type.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={18} className="text-brand-600" />
            <h3 className="text-base font-semibold text-gray-800">Issue Type Breakdown</h3>
          </div>
          <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {trends.issues_by_type.map((item) => (
              <div
                key={item.issue_type}
                className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100"
              >
                <p className="text-lg font-bold text-gray-800">{item.count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{item.issue_type}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
