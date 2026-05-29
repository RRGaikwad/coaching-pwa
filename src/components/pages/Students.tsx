import { useState, useMemo, useEffect } from "react";
import { Store, Student, User, DisplayCategory } from "../../data/store";

interface Props { user: User; }

const DISPLAYS: DisplayCategory[] = ["11th", "12th", "Gap"];

const emptyForm = () => ({
  name: "",
  email: "",
  password: "student123",
  phone: "",
  displayCategory: DISPLAYS[0],
  group: "PCM",
  totalFees: 0,
  parentName: "",
  parentPhone: "",
  enrolledDate: new Date().toISOString().split("T")[0],
});

export default function Students({ user }: Props) {
  const [students, setStudents] = useState<Student[]>(Store.getStudents());
  const [search, setSearch] = useState("");
  const [displayFilter, setDisplayFilter] = useState<DisplayCategory | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [toast, setToast] = useState("");

  if (user.role !== "admin") return null;

  // Dynamic group options based on category
  const getGroupOptions = (category: DisplayCategory) => {
    if (category === "Gap") {
      return ["Physics", "Chemistry", "Math", "Bio", "PCM", "PCB"];
    }
    return ["PCM", "PCB"];
  };

  // Ensure group is valid when category changes
  useEffect(() => {
    const options = getGroupOptions(form.displayCategory);
    if (!options.includes(form.group)) {
      setForm(prev => ({ ...prev, group: options[0] }));
    }
  }, [form.displayCategory]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.phone.includes(search);
      const matchDisplay = displayFilter === "all" || s.displayCategory === displayFilter;
      return matchSearch && matchDisplay;
    });
  }, [students, search, displayFilter]);

  const openAdd = () => {
    setEditStudent(null);
    setForm(emptyForm());
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    const existingUser = Store.getUsers().find((u) => u.studentId === s.id && u.role === "student");
    setForm({
      name: s.name,
      email: s.email,
      password: existingUser?.password || "student123",
      phone: s.phone,
      displayCategory: s.displayCategory,
      group: s.group,
      totalFees: s.totalFees,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
      enrolledDate: s.enrolledDate,
    });
    setShowModal(true);
  };

  const save = () => {
    if (!form.name || !form.email || !form.phone) return showToast("Please fill required fields");

    const studentId = editStudent ? editStudent.id : `s_${Date.now()}`;
    const studentData: Student = {
      id: studentId,
      name: form.name,
      email: form.email,
      phone: form.phone,
      displayCategory: form.displayCategory,
      group: form.group,
      totalFees: Number(form.totalFees),
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      enrolledDate: form.enrolledDate,
    };

    if (editStudent) {
      Store.updateStudent(studentData);
      const existingUser = Store.getUsers().find((u) => u.studentId === studentId && u.role === "student");
      if (existingUser) {
        Store.updateUser({
          ...existingUser,
          name: form.name,
          email: form.email,
          password: form.password,
          displayCategory: form.displayCategory,
        });
      }
    } else {
      Store.addStudent(studentData);
      Store.addUser({
        id: `u_${Date.now()}`,
        name: form.name,
        email: form.email,
        password: form.password,
        role: "student",
        studentId: studentId,
        displayCategory: form.displayCategory,
      });
    }

    setStudents(Store.getStudents());
    setShowModal(false);
    showToast(editStudent ? "Student updated!" : "Student added!");
  };

  const deleteStudent = (id: string) => {
    if (!confirm("Are you sure you want to delete this student? This will also remove their login account.")) return;
    
    // Delete student
    Store.deleteStudent(id);
    
    // Delete associated user
    const studentUser = Store.getUsers().find(u => u.studentId === id && u.role === "student");
    if (studentUser) {
      Store.deleteUser(studentUser.id);
    }

    setStudents(Store.getStudents());
    setViewStudent(null);
    showToast("Student deleted!");
  };

  const categoryCount = (cat: DisplayCategory) => students.filter((s) => s.displayCategory === cat).length;

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl">
          ✅ {toast}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-indigo-600 text-white rounded-2xl p-4 shadow text-center">
          <p className="text-3xl font-bold">{students.length}</p>
          <p className="text-xs opacity-80 mt-1">Total Students</p>
        </div>
        {DISPLAYS.map((d, i) => (
          <div
            key={d}
            className={`${["bg-emerald-500", "bg-violet-500", "bg-amber-500"][i]} text-white rounded-2xl p-4 shadow text-center`}
          >
            <p className="text-3xl font-bold">{categoryCount(d)}</p>
            <p className="text-xs opacity-80 mt-1">{d} Category</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 flex-1">
            <div className="relative flex-1 min-w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone..."
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <select
              value={displayFilter}
              onChange={(e) => setDisplayFilter(e.target.value as DisplayCategory | "all")}
              className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="all">All Categories</option>
              {DISPLAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={openAdd}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow"
          >
            + Add Student
          </button>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm py-12 text-center">
            <p className="text-4xl mb-3">👥</p>
            <p className="text-gray-500 text-sm">No students found</p>
          </div>
        )}
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 truncate">{s.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{s.email}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                      {s.displayCategory || "11th"}
                    </span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {s.group || "PCM"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-2 text-xs text-gray-500">
                <div>
                  <span className="font-medium text-gray-700">📞</span> {s.phone || "N/A"}
                </div>
                <div>
                  <span className="font-medium text-gray-700">💰</span> ₹{(s.totalFees || 0).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 flex gap-2 border-t border-gray-100">
              <button
                onClick={() => setViewStudent(s)}
                className="flex-1 text-xs text-indigo-600 font-medium py-1.5 rounded-lg hover:bg-indigo-50 transition"
              >
                View
              </button>
              <button
                onClick={() => openEdit(s)}
                className="flex-1 text-xs text-gray-600 font-medium py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Edit
              </button>
              <button
                onClick={() => deleteStudent(s.id)}
                className="flex-1 text-xs text-red-500 font-medium py-1.5 rounded-lg hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Student Profile</h3>
              <button onClick={() => setViewStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                  {viewStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{viewStudent.name}</h3>
                  <p className="text-sm text-gray-500">{viewStudent.email}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      {viewStudent.displayCategory || "11th"}
                    </span>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      {viewStudent.group || "PCM"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ["📞 Phone", viewStudent.phone || "N/A"],
                  ["💰 Total Fees", `₹${(viewStudent.totalFees || 0).toLocaleString()}`],
                  [
                    "📅 Enrolled",
                    new Date(viewStudent.enrolledDate || Date.now()).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }),
                  ],
                  ["👨‍👩‍👧 Parent", viewStudent.parentName],
                  ["📱 Parent Phone", viewStudent.parentPhone],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-medium text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setViewStudent(null);
                  openEdit(viewStudent);
                }}
                className="flex-1 border border-indigo-200 text-indigo-600 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-50"
              >
                Edit
              </button>
              <button
                onClick={() => deleteStudent(viewStudent.id)}
                className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-bold text-gray-800">{editStudent ? "Edit" : "Add"} Student</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Student full name"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Password *</label>
                  <input
                    type="text"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Password"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone *</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Category</label>
                  <select
                    value={form.displayCategory}
                    onChange={(e) => setForm({ ...form, displayCategory: e.target.value as DisplayCategory })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {DISPLAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Group</label>
                  <select
                    value={form.group}
                    onChange={(e) => setForm({ ...form, group: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    {getGroupOptions(form.displayCategory).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Total Fees (₹) *</label>
                  <input
                    type="number"
                    value={form.totalFees}
                    onChange={(e) => setForm({ ...form, totalFees: Number(e.target.value) })}
                    placeholder="0"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Enrolled Date</label>
                  <input
                    type="date"
                    value={form.enrolledDate}
                    onChange={(e) => setForm({ ...form, enrolledDate: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Parent Name</label>
                  <input
                    type="text"
                    value={form.parentName}
                    onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                    placeholder="Parent's name"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Parent Phone</label>
                  <input
                    type="tel"
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    placeholder="Parent's phone"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  {editStudent ? "Update" : "Add"} Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
