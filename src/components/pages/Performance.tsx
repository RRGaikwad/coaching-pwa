import { useState, useMemo } from "react";
import { User, Store, TestResult } from "../../data/store";

function computeGrade(marks: number, total: number): string {
  const pct = (marks / total) * 100;
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B+";
  if (pct >= 60) return "B";
  if (pct >= 50) return "C+";
  if (pct >= 40) return "C";
  return "F";
}

interface Props { user: User; }

const GRADE_COLOR = (g: string) => {
  if (g.startsWith("A")) return "bg-emerald-500";
  if (g.startsWith("B")) return "bg-blue-500";
  if (g.startsWith("C")) return "bg-amber-500";
  return "bg-red-500";
};

const PCT_COLOR = (p: number) => {
  if (p >= 80) return "bg-emerald-500";
  if (p >= 60) return "bg-blue-500";
  if (p >= 40) return "bg-amber-500";
  return "bg-red-500";
};

export default function Performance({ user }: Props) {
  const students = Store.getStudents();
  const [tests, setTests] = useState<TestResult[]>(Store.getTests());
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    user.role !== "admin" ? (user.studentId || "") : students[0]?.id || ""
  );
  const [showModal, setShowModal] = useState(false);
  const [editTest, setEditTest] = useState<TestResult | null>(null);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    studentId: students[0]?.id || "",
    subject: "",
    testName: "",
    date: "",
    marksObtained: "",
    totalMarks: "100",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const targetId = user.role === "admin" ? selectedStudentId : user.studentId!;
  const myTests = tests.filter((t) => t.studentId === targetId).sort((a, b) => b.date.localeCompare(a.date));

  const subjectSummary = useMemo(() => {
    const map = new Map<string, { marks: number[]; total: number[] }>();
    myTests.forEach((t) => {
      if (!map.has(t.subject)) map.set(t.subject, { marks: [], total: [] });
      map.get(t.subject)!.marks.push(t.marksObtained);
      map.get(t.subject)!.total.push(t.totalMarks);
    });
    return Array.from(map.entries()).map(([subject, data]) => {
      const avg = data.marks.reduce((s, m) => s + m, 0) / data.marks.length;
      const tot = data.total.reduce((s, m) => s + m, 0) / data.total.length;
      return { subject, avg: Math.round(avg), total: Math.round(tot), pct: Math.round((avg / tot) * 100), tests: data.marks.length };
    });
  }, [myTests]);

  const overall = myTests.length > 0
    ? Math.round(myTests.reduce((s, t) => s + (t.marksObtained / t.totalMarks) * 100, 0) / myTests.length)
    : 0;

  const openAdd = () => {
    setEditTest(null);
    setForm({ studentId: selectedStudentId || students[0]?.id || "", subject: "", testName: "", date: "", marksObtained: "", totalMarks: "100" });
    setShowModal(true);
  };

  const openEdit = (t: TestResult) => {
    setEditTest(t);
    setForm({ studentId: t.studentId, subject: t.subject, testName: t.testName, date: t.date, marksObtained: String(t.marksObtained), totalMarks: String(t.totalMarks) });
    setShowModal(true);
  };



  const saveTest = () => {
    if (!form.studentId || !form.subject || !form.testName || !form.date || !form.marksObtained || !form.totalMarks) return;
    const marks = parseInt(form.marksObtained);
    const total = parseInt(form.totalMarks);
    if (marks > total) return showToast("Marks obtained cannot exceed total marks!");
    const grade = computeGrade(marks, total);
    if (editTest) {
      const updated: TestResult = { ...editTest, studentId: form.studentId, subject: form.subject, testName: form.testName, date: form.date, marksObtained: marks, totalMarks: total, grade };
      Store.updateTest(updated);
    } else {
      const newTest: TestResult = { id: `t_${Date.now()}`, studentId: form.studentId, subject: form.subject, testName: form.testName, date: form.date, marksObtained: marks, totalMarks: total, grade };
      Store.addTest(newTest);
    }
    setTests(Store.getTests());
    setShowModal(false);
    showToast(editTest ? "Test updated!" : "Test result added!");
  };

  const deleteTest = (id: string) => {
    Store.deleteTest(id);
    setTests(Store.getTests());
    showToast("Test deleted!");
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl">
          ✅ {toast}
        </div>
      )}

      {/* Student Selector (Admin) */}
      {user.role === "admin" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-wrap gap-4 items-end justify-between">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Select Student</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.group})</option>)}
            </select>
          </div>
          <button onClick={openAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow">
            + Add Test Result
          </button>
        </div>
      )}

      {/* Overall Score */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm">Overall Performance</p>
            <p className="text-4xl font-bold mt-1">{overall}%</p>
            <p className="text-sm text-indigo-200 mt-1">{myTests.length} tests • {subjectSummary.length} subjects</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold shadow-inner ${overall >= 80 ? "bg-emerald-500" : overall >= 60 ? "bg-amber-500" : "bg-red-500"}`}>
              {overall >= 80 ? "A" : overall >= 60 ? "B" : overall >= 40 ? "C" : "F"}
            </div>
            <p className="text-xs text-indigo-200 mt-1">Overall Grade</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${overall}%` }} />
        </div>
      </div>

      {/* Subject-wise Summary */}
      {subjectSummary.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Subject-wise Performance</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectSummary.map((s) => (
              <div key={s.subject} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm">{s.subject}</h4>
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full ${PCT_COLOR(s.pct)}`}>{s.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${PCT_COLOR(s.pct)}`} style={{ width: `${s.pct}%` }} />
                </div>
                <p className="text-xs text-gray-400">Avg: {s.avg}/{s.total} • {s.tests} test{s.tests !== 1 ? "s" : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Results Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Test History</h3>
          {user.role === "admin" && <button onClick={openAdd} className="text-xs text-indigo-600 font-medium hover:underline">+ Add</button>}
        </div>

        {myTests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-500 text-sm">No test results found.</p>
            {user.role === "admin" && <button onClick={openAdd} className="mt-3 text-sm text-indigo-600 hover:underline">Add first result →</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Test</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Subject</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Score</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">%</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Grade</th>
                  {user.role === "admin" && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {myTests.map((t) => {
                  const pct = Math.round((t.marksObtained / t.totalMarks) * 100);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-800">{t.testName}</td>
                      <td className="px-5 py-3 text-gray-600">{t.subject}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-5 py-3 font-semibold text-gray-800">{t.marksObtained}/{t.totalMarks}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${PCT_COLOR(pct)}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-600">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs text-white px-2.5 py-1 rounded-full font-bold ${GRADE_COLOR(t.grade)}`}>{t.grade}</span>
                      </td>
                      {user.role === "admin" && (
                        <td className="px-5 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(t)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                            <button onClick={() => deleteTest(t.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">{editTest ? "Edit" : "Add"} Test Result</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Student *</label>
                <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Subject *</label>
                  <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Mathematics" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Test Name *</label>
                  <input type="text" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })}
                    placeholder="Unit Test 1" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Date *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Marks Obtained *</label>
                  <input type="number" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: e.target.value })}
                    placeholder="85" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Total Marks *</label>
                  <input type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                    placeholder="100" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              {form.marksObtained && form.totalMarks && (
                <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-3">
                  <span className={`text-white text-sm font-bold px-3 py-1 rounded-full ${GRADE_COLOR(computeGrade(parseInt(form.marksObtained), parseInt(form.totalMarks)))}`}>
                    {computeGrade(parseInt(form.marksObtained), parseInt(form.totalMarks))}
                  </span>
                  <p className="text-sm text-indigo-700 font-medium">
                    {Math.round((parseInt(form.marksObtained) / parseInt(form.totalMarks)) * 100)}% score
                  </p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={saveTest} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">
                {editTest ? "Update" : "Add Result"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


}
