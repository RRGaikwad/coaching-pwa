import React, { useState } from "react";
import { Store, User } from "../data/store";

interface Props {
  onLogin: (user: User) => void;
}

const QUICK_LOGINS = [
  { label: "Teacher", email: "vikram@teacher.com", password: "teacher123", color: "bg-blue-600", icon: "👨‍🏫" },
  { label: "Student", email: "aarav@student.com", password: "student123", color: "bg-emerald-600", icon: "🎓" },
  { label: "Parent", email: "rajesh@parent.com", password: "parent123", color: "bg-amber-600", icon: "👨‍👩‍👧" },
];

const ADMIN_CREDENTIALS = { label: "Admin", email: "admin@educoach.com", password: "admin123", color: "bg-indigo-600", icon: "🛡️" };

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);
    if (newCount === 5) {
      setShowAdmin(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = Store.authenticate(email.trim(), password);
      if (user) {
        Store.setSession(user);
        onLogin(user);
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setLoading(false);
    }, 600);
  };

  const quickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
    setLoading(true);
    setError("");
    setTimeout(() => {
      const user = Store.authenticate(em, pw);
      if (user) { Store.setSession(user); onLogin(user); }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 flex flex-col items-center justify-center p-4">
      {/* Logo / Brand */}
      <div className="text-center mb-8">
        <button 
          onClick={handleLogoClick}
          className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 shadow-2xl border border-white/20 active:scale-95 transition-transform"
        >
          <span className="text-4xl">📚</span>
        </button>
        <h1 className="text-3xl font-bold text-white tracking-tight">EduCoach</h1>
        <p className="text-indigo-200 text-sm mt-1">Coaching Institute Management</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-lg shadow-indigo-200 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>
        </div>

        {/* Quick Access */}
        <div className="bg-gray-50 px-8 pb-8 pt-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">Quick Demo Access</p>
          <div className={`grid ${showAdmin ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
            {QUICK_LOGINS.map((q) => (
              <button
                key={q.label}
                onClick={() => quickLogin(q.email, q.password)}
                className={`${q.color} text-white rounded-xl py-2.5 px-2 text-xs font-semibold flex flex-col items-center gap-1 hover:opacity-90 transition`}
              >
                <span className="text-lg">{q.icon}</span>
                {q.label}
              </button>
            ))}
            {showAdmin && (
              <button
                onClick={() => quickLogin(ADMIN_CREDENTIALS.email, ADMIN_CREDENTIALS.password)}
                className={`${ADMIN_CREDENTIALS.color} text-white rounded-xl py-2.5 px-2 text-xs font-semibold flex flex-col items-center gap-1 hover:opacity-90 transition animate-in zoom-in-95 duration-300`}
              >
                <span className="text-lg">{ADMIN_CREDENTIALS.icon}</span>
                {ADMIN_CREDENTIALS.label}
              </button>
            )}
          </div>
        </div>
      </div>

      <p className="text-indigo-300 text-xs mt-6 text-center">
        EduCoach v1.0 • Powered by LocalStorage • PWA Ready
      </p>
    </div>
  );
}
