import React, { useState } from "react";
import { Droplets, LogIn, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { login, register } from "../services/api";
import { useAuth } from "../services/AuthContext";

export default function LoginPage() {
  const { loginUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isRegister) {
        res = await register(form.username, form.email, form.password);
      } else {
        res = await login(form.email, form.password);
      }
      loginUser(res.data.token, res.data.user);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Authentication failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-blue-900 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30 mb-4">
            <Droplets size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">WaterWatch AI</h1>
          <p className="text-brand-300 text-sm mt-1">AI-Powered Water & Sanitation Intelligence</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-brand-200 mb-1.5">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required={isRegister}
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Your username"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                             placeholder-white/40 focus:ring-2 focus:ring-brand-400 focus:border-transparent
                             outline-none transition"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-brand-200 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white
                           placeholder-white/40 focus:ring-2 focus:ring-brand-400 focus:border-transparent
                           outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-200 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-12 text-white
                             placeholder-white/40 focus:ring-2 focus:ring-brand-400 focus:border-transparent
                             outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-xl text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600
                         text-white py-3 rounded-xl font-semibold shadow-lg shadow-brand-500/30
                         transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isRegister ? (
                <>
                  <UserPlus size={18} /> Create Account
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(null); }}
              className="text-sm text-brand-300 hover:text-white transition"
            >
              {isRegister
                ? "Already have an account? Sign In"
                : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-6">
          SDG-6: Clean Water & Sanitation — Hackathon 2026
        </p>
      </div>
    </div>
  );
}
