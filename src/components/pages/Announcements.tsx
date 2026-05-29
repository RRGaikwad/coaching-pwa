import { useState } from "react";
import { User, Store, Announcement } from "../../data/store";

interface Props { user: User; }

export default function Announcements({ user }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(Store.getAnnouncements());
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const [form, setForm] = useState({
    title: "",
    message: "",
    priority: "medium" as "low" | "medium" | "high",
    targetRole: "all" as "all" | "student" | "parent",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const visible = announcements.filter((a) => {
    const matchRole = user.role === "admin" ? true : (a.targetRole === "all" || a.targetRole === user.role);
    const matchPriority = filter === "all" ? true : a.priority === filter;
    return matchRole && matchPriority;
  });

  const addAnnouncement = () => {
    if (!form.title || !form.message) return showToast("Please fill in all fields");
    const a: Announcement = {
      id: `n_${Date.now()}`,
      title: form.title,
      message: form.message,
      priority: form.priority,
      targetRole: form.targetRole,
      date: new Date().toISOString().split("T")[0],
    };
    Store.addAnnouncement(a);
    setAnnouncements(Store.getAnnouncements());
    setShowModal(false);
    setForm({ title: "", message: "", priority: "medium", targetRole: "all" });
    showToast("Announcement posted!");
  };

  const priorityConfig = {
    high: { label: "High", color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", icon: "🔴" },
    medium: { label: "Medium", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", icon: "🟡" },
    low: { label: "Low", color: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500", icon: "🔵" },
  };

  const targetLabel = (role: string) => {
    if (role === "all") return "Everyone";
    if (role === "student") return "Students";
    return "Parents";
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl">
          ✅ {toast}
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-2">
            {(["all", "high", "medium", "low"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filter === f ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f === "all" ? "All" : priorityConfig[f].icon + " " + priorityConfig[f].label}
              </button>
            ))}
          </div>
          {user.role === "admin" && (
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow">
              📢 Post Announcement
            </button>
          )}
        </div>
      </div>

      {/* Stats for Admin */}
      {user.role === "admin" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-red-500 text-white rounded-2xl p-4 text-center shadow">
            <p className="text-2xl font-bold">{announcements.filter((a) => a.priority === "high").length}</p>
            <p className="text-xs opacity-80 mt-1">High Priority</p>
          </div>
          <div className="bg-amber-500 text-white rounded-2xl p-4 text-center shadow">
            <p className="text-2xl font-bold">{announcements.filter((a) => a.priority === "medium").length}</p>
            <p className="text-xs opacity-80 mt-1">Medium Priority</p>
          </div>
          <div className="bg-indigo-600 text-white rounded-2xl p-4 text-center shadow">
            <p className="text-2xl font-bold">{announcements.length}</p>
            <p className="text-xs opacity-80 mt-1">Total Posted</p>
          </div>
        </div>
      )}

      {/* Announcement List */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center">
            <p className="text-4xl mb-3">📢</p>
            <p className="text-gray-500 text-sm">No announcements found.</p>
          </div>
        )}
        {visible.map((a) => {
          const cfg = priorityConfig[a.priority];
          return (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
              <div className={`h-1 ${cfg.dot}`} />
              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-base">{a.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        📍 {targetLabel(a.targetRole)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{a.message}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400">
                        📅 {new Date(a.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl flex-shrink-0 opacity-20">{cfg.icon}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Post Announcement</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Announcement title" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Message *</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4} placeholder="Write the announcement message..."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="low">🔵 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Target Audience</label>
                  <select value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value as any })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="all">Everyone</option>
                    <option value="student">Students only</option>
                    <option value="parent">Parents only</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={addAnnouncement} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">Post Now</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
