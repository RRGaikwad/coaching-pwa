import { useState, useMemo } from "react";
import { User, Store, AttendanceRecord } from "../../data/store";

interface Props { user: User; }

export default function Attendance({ user }: Props) {
  const students = Store.getStudents();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(Store.getAttendance());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    user.role === "teacher" && user.displayCategory ? user.displayCategory : "all"
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    user.role === "student" || user.role === "parent" ? (user.studentId || "") : "all"
  );
  const [viewMode, setViewMode] = useState<"mark" | "history">(
    user.role === "admin" || user.role === "teacher" ? "mark" : "history"
  );
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const studentId = (user.role === "student" || user.role === "parent") ? user.studentId! : selectedStudentId;
  const targetStudent = students.find((s) => s.id === studentId);

  // Mark attendance
  const markAttendance = (sid: string, status: "present" | "absent" | "late") => {
    const subject = user.role === "teacher" ? user.subject : (students.find((s) => s.id === sid)?.subject || "General");
    const record: AttendanceRecord = {
      id: `a_${sid}_${selectedDate}_${subject}`,
      studentId: sid,
      date: selectedDate,
      status,
      subject: subject || "General",
    };
    Store.addAttendance(record);
    setAttendance(Store.getAttendance());
    showToast(`Marked ${status} for ${students.find((s) => s.id === sid)?.name}`);
  };

  const getStatus = (sid: string, date: string) => {
    const subject = user.role === "teacher" ? user.subject : null;
    return attendance.find((a) => 
      a.studentId === sid && 
      a.date === date && 
      (!subject || a.subject === subject)
    )?.status;
  };

  // Filter students for marking
  const studentsToMark = useMemo(() => {
    if (user.role === "admin") {
      return selectedCategory === "all" ? students : students.filter(s => s.displayCategory === selectedCategory);
    }
    if (user.role === "teacher") {
      return students.filter(s => s.displayCategory === user.displayCategory);
    }
    return [];
  }, [students, user, selectedCategory]);

  // History for student/parent
  const myAttendance = useMemo(() =>
    attendance
      .filter((a) => a.studentId === (user.role === "admin" ? selectedStudentId : user.studentId))
      .sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, user, selectedStudentId]
  );

  const presentCount = myAttendance.filter((a) => a.status === "present").length;
  const absentCount = myAttendance.filter((a) => a.status === "absent").length;
  const lateCount = myAttendance.filter((a) => a.status === "late").length;
  const total = myAttendance.length;
  const pct = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0;

  const statusBadge = (s?: string) => {
    if (s === "present") return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Present</span>;
    if (s === "absent") return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Absent</span>;
    if (s === "late") return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">Late</span>;
    return <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">—</span>;
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl animate-bounce">
          ✅ {toast}
        </div>
      )}

      {/* Admin/Teacher Controls */}
      {(user.role === "admin" || user.role === "teacher") && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex flex-wrap gap-3 items-end justify-between">
            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              {user.role === "admin" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="all">All Categories</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                    <option value="Gap">Gap</option>
                  </select>
                </div>
              )}
              {user.role === "teacher" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Assigned Category</label>
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-xl font-semibold text-gray-700">
                    {user.displayCategory}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("mark")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${viewMode === "mark" ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                ✏️ Mark
              </button>
              <button
                onClick={() => setViewMode("history")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${viewMode === "history" ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                📋 History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Attendance (Admin/Teacher) */}
      {(user.role === "admin" || user.role === "teacher") && viewMode === "mark" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              Mark Attendance — {new Date(selectedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {user.role === "teacher" && <span className="ml-2 text-blue-600">({user.subject})</span>}
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">{studentsToMark.length} students</span>
          </div>
          <div className="divide-y divide-gray-50">
            {studentsToMark.map((s) => {
              const current = getStatus(s.id, selectedDate);
              return (
                <div key={s.id} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.displayCategory} • {user.role === "teacher" ? user.subject : s.subject}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {(["present", "absent", "late"] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => markAttendance(s.id, st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border ${
                          current === st
                            ? st === "present" ? "bg-green-500 text-white border-green-500"
                              : st === "absent" ? "bg-red-500 text-white border-red-500"
                              : "bg-amber-500 text-white border-amber-500"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {st === "present" ? "P" : st === "absent" ? "A" : "L"}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
            {studentsToMark.length === 0 && (
              <div className="p-12 text-center text-gray-400 text-sm">
                No students found in the selected category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* History View */}
      {(viewMode === "history" || user.role !== "admin") && (
        <>
          {/* Student Selector for admin */}
          {user.role === "admin" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="all">— Choose a student —</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.displayCategory})</option>)}
              </select>
            </div>
          )}

          {/* Summary Cards */}
          {(targetStudent || user.role !== "admin") && myAttendance.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-indigo-600 text-white rounded-2xl p-4 text-center shadow">
                  <p className="text-3xl font-bold">{pct}%</p>
                  <p className="text-xs opacity-80 mt-1">Overall Rate</p>
                </div>
                <div className="bg-emerald-500 text-white rounded-2xl p-4 text-center shadow">
                  <p className="text-3xl font-bold">{presentCount}</p>
                  <p className="text-xs opacity-80 mt-1">Present</p>
                </div>
                <div className="bg-red-500 text-white rounded-2xl p-4 text-center shadow">
                  <p className="text-3xl font-bold">{absentCount}</p>
                  <p className="text-xs opacity-80 mt-1">Absent</p>
                </div>
                <div className="bg-amber-500 text-white rounded-2xl p-4 text-center shadow">
                  <p className="text-3xl font-bold">{lateCount}</p>
                  <p className="text-xs opacity-80 mt-1">Late</p>
                </div>
              </div>

              {/* Attendance Bar */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Attendance Progress</p>
                  <p className="text-sm font-bold text-indigo-600">{pct}%</p>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {pct >= 75 ? "✅ Good attendance" : pct >= 50 ? "⚠️ Attendance needs improvement" : "❌ Critical — attendance is low"}
                </p>
              </div>

              {/* Records Table */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">Attendance History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Day</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                        <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {myAttendance.map((a) => (
                        <tr key={a.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 text-gray-700">{new Date(a.date).toLocaleDateString("en-IN")}</td>
                          <td className="px-5 py-3 text-gray-500">{new Date(a.date).toLocaleDateString("en-IN", { weekday: "short" })}</td>
                          <td className="px-5 py-3 text-gray-500">{a.subject}</td>
                          <td className="px-5 py-3">{statusBadge(a.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {myAttendance.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 text-sm">No attendance records found.</p>
              {user.role === "admin" && <p className="text-gray-400 text-xs mt-1">Select a student to view their history.</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
