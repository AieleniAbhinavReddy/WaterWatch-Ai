import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
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
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import ReportIssue from "./pages/ReportIssue";
import RiskPrediction from "./pages/RiskPrediction";
import WaterAnalytics from "./pages/WaterAnalytics";
import HygieneAwareness from "./pages/HygieneAwareness";
import AdminPanel from "./pages/AdminPanel";

/* ---------- Sidebar Navigation ---------- */

const NAV_SECTIONS = [
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
    title: "Management",
    items: [
      { to: "/admin", label: "Admin Panel", icon: Shield },
    ],
  },
];

// Flat list for TopBar title lookup
const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
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
            <h1 className="text-lg font-bold tracking-tight leading-none">
              AquaVision
            </h1>
            <p className="text-[10px] text-brand-300 tracking-widest uppercase">
              Intelligence Platform
            </p>
          </div>
          <button className="ml-auto lg:hidden" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-brand-400 uppercase">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-[10px] text-brand-400">
            © 2026 AquaVision v1.0
          </p>
        </div>
      </aside>
    </>
  );
}

/* ---------- Top Bar ---------- */

function TopBar({ onMenuClick }) {
  const location = useLocation();
  const pageTitle =
    NAV_ITEMS.find(
      (n) => n.to === location.pathname || (n.to === "/" && location.pathname === "/")
    )?.label || "AquaVision";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="flex items-center justify-between px-4 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            onClick={onMenuClick}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">{pageTitle}</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              className="bg-transparent outline-none text-sm w-40 placeholder-gray-400"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold ml-1">
            AV
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- App Shell ---------- */

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/predict" element={<RiskPrediction />} />
              <Route path="/analytics" element={<WaterAnalytics />} />
              <Route path="/hygiene" element={<HygieneAwareness />} />
              <Route path="/admin" element={<AdminPanel />} />
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
      <AppContent />
    </Router>
  );
}
