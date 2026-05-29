import { useMemo, useState } from "react";
import { User, Store, Student, DisplayCategory } from "../../data/store";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className={`${color} rounded-2xl p-5 text-white shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        {sub && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{sub}</span>}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm opacity-80 mt-1">{label}</p>
    </div>
  );
}

interface Props { user: User; onNavigate: (page: any) => void; }

export default function Dashboard({ user, onNavigate }: Props) {
  const [activeDisplay, setActiveDisplay] = useState<DisplayCategory | "All">("All");
  
  const students = Store.getStudents();
  const filteredStudents = useMemo(() => {
    if (user.role === "admin" && activeDisplay !== "All") {
      return students.filter(s => s.displayCategory === activeDisplay);
    }
    return students;
  }, [students, user.role, activeDisplay]);

  const attendance = Store.getAttendance();
  const filteredAttendance = useMemo(() => {
    if (user.role === "admin" && activeDisplay !== "All") {
      const studentIds = new Set(filteredStudents.map(s => s.id));
      return attendance.filter(a => studentIds.has(a.studentId));
    }
    return attendance;
  }, [attendance, filteredStudents, user.role, activeDisplay]);

  const fees = Store.getFees();
  const filteredFees = useMemo(() => {
    if (user.role === "admin" && activeDisplay !== "All") {
      const studentIds = new Set(filteredStudents.map(s => s.id));
      return fees.filter(f => studentIds.has(f.studentId));
    }
    return fees;
  }, [fees, filteredStudents, user.role, activeDisplay]);

  const tests = Store.getTests();
  const announcements = Store.getAnnouncements();

  const today = new Date().toISOString().split("T")[0];

  const stats = useMemo(() => {
    if (user.role === "admin") {
      const todayAtt = filteredAttendance.filter((a) => a.date === today);
      const presentToday = todayAtt.filter((a) => a.status === "present").length;
      const pendingFees = filteredFees.filter((f) => f.status === "pending" || f.status === "overdue").length;
      const totalRevenue = filteredFees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
      const totalTeachers = Store.getUsers().filter(u => u.role === "teacher").length;
      return { presentToday, pendingFees, totalRevenue, totalTeachers };
    }
    return null;
  }, [user, filteredAttendance, filteredFees, today]);

  const studentData = useMemo((): { student: Student | null; attendancePct: number; pendingFees: number; avgScore: number } => {
    if (user.role === "student" || user.role === "parent") {
      const student = students.find((s) => s.id === user.studentId) || null;
      if (!student) return { student: null, attendancePct: 0, pendingFees: 0, avgScore: 0 };
      const myAtt = attendance.filter((a) => a.studentId === student.id);
      const presentCount = myAtt.filter((a) => a.status === "present").length;
      const attendancePct = myAtt.length > 0 ? Math.round((presentCount / myAtt.length) * 100) : 0;
      const pendingFees = fees.filter((f) => f.studentId === student.id && (f.status === "pending" || f.status === "overdue")).length;
      const myTests = tests.filter((t) => t.studentId === student.id);
      const avgScore = myTests.length > 0 ? Math.round(myTests.reduce((s, t) => s + (t.marksObtained / t.totalMarks) * 100, 0) / myTests.length) : 0;
      return { student, attendancePct, pendingFees, avgScore };
    }
    return { student: null, attendancePct: 0, pendingFees: 0, avgScore: 0 };
  }, [user, students, attendance, fees, tests]);

  const recentAnnouncements = announcements
    .filter((a) => a.targetRole === "all" || a.targetRole === user.role)
    .slice(0, 3);

  const priorityColor = (p: string) => {
    if (p === "high") return "bg-red-100 text-red-700 border-red-200";
    if (p === "medium") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  return (
    <div className="space-y-6">
      {/* Admin Display Selector */}
      {user.role === "admin" && (
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
          {(["All", "11th", "12th", "Gap"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setActiveDisplay(d)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeDisplay === d
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-indigo-200 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold mt-0.5">{user.name} 👋</h2>
            <p className="text-indigo-200 text-sm mt-2">
              {user.role === "admin" && "Here's what's happening at your institute today."}
              {user.role === "student" && `You are viewing your ${user.displayCategory} academic year portal.`}
              {user.role === "parent" && `Stay informed about your child's ${user.displayCategory} progress.`}
              {user.role === "teacher" && `Managing attendance for ${user.displayCategory} category.`}
            </p>
          </div>
          <div className="text-5xl opacity-30">
            {user.role === "admin" ? "🏫" : user.role === "student" ? "🎓" : "👨‍👩‍👧"}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {user.role === "admin" && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={filteredStudents.length} icon="👥" color="bg-indigo-600" />
          <StatCard label="Total Teachers" value={stats.totalTeachers} icon="👨‍🏫" color="bg-blue-600" />
          <StatCard label="Present Today" value={stats.presentToday} icon="✅" color="bg-emerald-600" sub={`of ${filteredStudents.length}`} />
          <StatCard label="Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon="💰" color="bg-violet-600" />
        </div>
      )}

      {(user.role === "student" || user.role === "parent") && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Attendance Rate" value={`${studentData.attendancePct}%`} icon="📋" color="bg-indigo-600" />
          <StatCard label="Pending Fees" value={studentData.pendingFees} icon="💳" color={studentData.pendingFees > 0 ? "bg-red-500" : "bg-emerald-600"} sub="months" />
          <StatCard label="Avg Score" value={`${studentData.avgScore}%`} icon="📊" color="bg-violet-600" />
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { label: "Attendance", icon: "📋", page: "attendance", color: "border-indigo-200 hover:bg-indigo-50", roles: ["admin", "student", "parent", "teacher"] },
            { label: "Fees", icon: "💳", page: "fees", color: "border-emerald-200 hover:bg-emerald-50", roles: ["admin", "student", "parent"] },
            { label: "Performance", icon: "📊", page: "performance", color: "border-violet-200 hover:bg-violet-50", roles: ["admin", "student", "parent"] },
            { label: "Announcements", icon: "📢", page: "announcements", color: "border-amber-200 hover:bg-amber-50", roles: ["admin", "student", "parent", "teacher"] },
            { label: "Students", icon: "👥", page: "students", color: "border-indigo-200 hover:bg-indigo-50", roles: ["admin"] },
            { label: "Teachers", icon: "👨‍🏫", page: "teachers", color: "border-blue-200 hover:bg-blue-50", roles: ["admin"] },
          ].filter(a => a.roles.includes(user.role)).map((a) => (
            <button
              key={a.page}
              onClick={() => onNavigate(a.page)}
              className={`bg-white border-2 ${a.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-150 hover:shadow-md`}
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-gray-600">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">📢 Recent Announcements</h3>
            <button onClick={() => onNavigate("announcements")} className="text-xs text-indigo-600 font-medium hover:underline">View all</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentAnnouncements.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No announcements</p>
            )}
            {recentAnnouncements.map((a) => (
              <div key={a.id} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">{a.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${priorityColor(a.priority)}`}>{a.priority}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(a.date).toLocaleDateString("en-IN")}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin: Today's Attendance / Student: Recent Tests */}
        {user.role === "admin" ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">📋 Today's Attendance</h3>
              <button onClick={() => onNavigate("attendance")} className="text-xs text-indigo-600 font-medium hover:underline">Manage</button>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredStudents.slice(0, 5).map((s) => {
                const att = filteredAttendance.find((a) => a.studentId === s.id && a.date === today);
                return (
                  <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{s.name}</p>
                      <p className="text-xs text-gray-400">{s.displayCategory}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      att?.status === "present" ? "bg-green-100 text-green-700" :
                      att?.status === "absent" ? "bg-red-100 text-red-700" :
                      att?.status === "late" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {att ? att.status.charAt(0).toUpperCase() + att.status.slice(1) : "Not marked"}
                    </span>
                  </div>
                );
              })}
              {filteredStudents.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No students in this category</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">📊 Recent Test Results</h3>
              <button onClick={() => onNavigate("performance")} className="text-xs text-indigo-600 font-medium hover:underline">View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {tests.filter((t) => t.studentId === user.studentId).slice(-4).reverse().map((t) => {
                const pct = Math.round((t.marksObtained / t.totalMarks) * 100);
                return (
                  <div key={t.id} className="px-5 py-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"
                    }`}>
                      {t.grade}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{t.testName}</p>
                      <p className="text-xs text-gray-400">{t.subject}</p>
                    </div>
                    <p className="text-sm font-bold text-gray-700">{t.marksObtained}/{t.totalMarks}</p>
                  </div>
                );
              })}
              {tests.filter((t) => t.studentId === user.studentId).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No test results yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
