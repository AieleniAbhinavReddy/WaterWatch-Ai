import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  Menu,
  X,
  Droplets,
  Bell,
  Search,
  BarChart3,
  Heart,
  Shield,
  Leaf,
  FlaskConical,
  LogOut,
  Loader2,
} from "lucide-react";

import { AuthProvider, useAuth } from "./services/AuthContext";
import { searchComplaints, getRecentComplaints } from "./services/api";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import RiskPrediction from "./pages/RiskPrediction";
import WaterAnalytics from "./pages/WaterAnalytics";
import HygieneAwareness from "./pages/HygieneAwareness";
import AdminPanel from "./pages/AdminPanel";
import WaterConservation from "./pages/WaterConservation";
import WaterQualityRisk from "./pages/WaterQualityRisk";

/* ---------- Role-based Navigation ---------- */

const USER_NAV_SECTIONS = [
  {
    title: "Main Menu",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/report", label: "Report Issue", icon: AlertTriangle },
      { to: "/predict", label: "Risk Prediction", icon: Activity },
    ],
  },
  {
    title: "Insights",
    items: [
      { to: "/analytics", label: "Water Analytics", icon: BarChart3 },
      { to: "/hygiene", label: "Hygiene Awareness", icon: Heart },
    ],
  },
  {
    title: "AI Features",
    items: [
      { to: "/conservation", label: "Water Conservation", icon: Leaf },
      { to: "/water-quality", label: "Water Quality", icon: FlaskConical },
    ],
  },
];

const ADMIN_NAV_SECTIONS = [
  {
    title: "Administration",
    items: [
      { to: "/admin", label: "Admin Panel", icon: Shield },
    ],
  },
  {
    title: "Analytics",
    items: [
      { to: "/analytics", label: "Water Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "AI Features",
    items: [
      { to: "/conservation", label: "Water Conservation", icon: Leaf },
      { to: "/water-quality", label: "Water Quality", icon: FlaskConical },
    ],
  },
];

function getNavSections(role) {
  return role === "admin" ? ADMIN_NAV_SECTIONS : USER_NAV_SECTIONS;
}

/* ---------- Sidebar ---------- */

function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navSections = getNavSections(user?.role);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-brand-950 text-white flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center">
            <Droplets size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">WaterWatch AI</h1>
            <p className="text-[10px] text-brand-300 tracking-widest uppercase">
              Intelligence Platform
            </p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* User badge */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-brand-400 uppercase tracking-wider">
                {user?.role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-brand-400 uppercase">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/" || to === "/admin"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                          : "text-brand-200 hover:bg-white/10 hover:text-white"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-3 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300
                       hover:bg-red-500/20 hover:text-red-200 transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10">
          <p className="text-[10px] text-brand-400">&copy; 2026 WaterWatch AI v2.0</p>
        </div>
      </aside>
    </>
  );
}

/* ---------- Top Bar ---------- */

function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navSections = getNavSections(user?.role);
  const allItems = navSections.flatMap((s) => s.items);
  const pageTitle =
    allItems.find(
      (n) => n.to === location.pathname || (n.to === "/" && location.pathname === "/")
    )?.label || "WaterWatch AI";

  // --- Search state ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchTimer = useRef(null);

  const doSearch = useCallback((q) => {
    if (!q.trim()) { setSearchResults([]); setSearchOpen(false); return; }
    searchComplaints(q.trim())
      .then((res) => { setSearchResults(res.data.slice(0, 8)); setSearchOpen(true); })
      .catch(() => setSearchResults([]));
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(val), 300);
  };

  const handleResultClick = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchOpen(false);
    navigate(user?.role === "admin" ? "/admin" : "/");
  };

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- Notification state ---
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef(null);

  const fetchNotifications = () => {
    if (notifOpen) { setNotifOpen(false); return; }
    setNotifLoading(true);
    getRecentComplaints(6)
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifications([]))
      .finally(() => { setNotifLoading(false); setNotifOpen(true); });
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-gray-100 lg:hidden" onClick={onMenuClick}>
            <Menu size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:block relative" ref={searchRef}>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search complaints…"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                className="bg-transparent outline-none text-sm w-48 placeholder-gray-400"
              />
            </div>
            {searchOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                {searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No results found</p>
                ) : (
                  searchResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={handleResultClick}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            c.status === "Resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : c.status === "In Progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {c.status}
                        </span>
                        <span className="text-xs text-gray-400">{c.issue_type}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button className="p-2 rounded-lg hover:bg-gray-100 relative" onClick={fetchNotifications}>
              <Bell size={18} className="text-gray-500" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {notifications.length}
                </span>
              )}
              {notifications.length === 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-xl shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800">Recent Activity</p>
                </div>
                {notifLoading ? (
                  <p className="px-4 py-3 text-sm text-gray-400">Loading…</p>
                ) : notifications.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-gray-400">No recent activity</p>
                ) : (
                  notifications.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setNotifOpen(false);
                        navigate(user?.role === "admin" ? "/admin" : "/");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            c.status === "Pending"
                              ? "bg-red-500"
                              : c.status === "In Progress"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1 ml-4">
                        <span className="text-xs text-gray-400">{c.issue_type}</span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(c.created_at)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* User badge & logout */}
          <div className="flex items-center gap-2 ml-1">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- App Shell ---------- */

function AppContent() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const isAdmin = user.role === "admin";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            <Routes>
              {isAdmin ? (
                <>
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/analytics" element={<WaterAnalytics />} />
                  <Route path="/conservation" element={<WaterConservation />} />
                  <Route path="/water-quality" element={<WaterQualityRisk />} />
                  <Route path="*" element={<Navigate to="/admin" replace />} />
                </>
              ) : (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/report" element={<ReportIssue />} />
                  <Route path="/predict" element={<RiskPrediction />} />
                  <Route path="/analytics" element={<WaterAnalytics />} />
                  <Route path="/hygiene" element={<HygieneAwareness />} />
                  <Route path="/conservation" element={<WaterConservation />} />
                  <Route path="/water-quality" element={<WaterQualityRisk />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </>
              )}
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
