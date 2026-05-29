import { useState } from "react";
import { User, Store, FeeRecord } from "../../data/store";

interface Props { user: User; }

export default function Fees({ user }: Props) {
  const students = Store.getStudents();
  const [fees, setFees] = useState<FeeRecord[]>(Store.getFees());
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    user.role !== "admin" ? (user.studentId || "") : "all"
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState("");

  const [newFee, setNewFee] = useState({
    studentId: "",
    month: "",
    amount: "",
    dueDate: "",
    description: "Monthly Tuition Fee",
    status: "pending" as "pending" | "paid",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const studentId = user.role !== "admin" ? user.studentId! : selectedStudentId;

  const filtered = fees.filter((f) => {
    const matchStudent = studentId === "all" ? true : f.studentId === studentId;
    const matchStatus = filterStatus === "all" ? true : f.status === filterStatus;
    return matchStudent && matchStatus;
  }).sort((a, b) => b.month.localeCompare(a.month));

  const markPaid = (f: FeeRecord) => {
    const updated = { ...f, status: "paid" as const, paidOn: new Date().toISOString().split("T")[0] };
    Store.updateFee(updated);
    setFees(Store.getFees());
    showToast("Fee marked as paid!");
  };

  const totalPaid = fees.filter((f) => (studentId === "all" ? true : f.studentId === studentId) && f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const totalPending = fees.filter((f) => (studentId === "all" ? true : f.studentId === studentId) && (f.status === "pending" || f.status === "overdue")).reduce((s, f) => s + f.amount, 0);

  const addFee = () => {
    if (!newFee.studentId || !newFee.month || !newFee.amount || !newFee.dueDate) return;
    const record: FeeRecord = {
      id: `f_${Date.now()}`,
      studentId: newFee.studentId,
      month: newFee.month,
      amount: parseInt(newFee.amount),
      status: newFee.status,
      dueDate: newFee.dueDate,
      description: newFee.description,
      ...(newFee.status === "paid" ? { paidOn: new Date().toISOString().split("T")[0] } : {}),
    };
    Store.addFee(record);
    setFees(Store.getFees());
    setShowAddModal(false);
    setNewFee({ studentId: "", month: "", amount: "", dueDate: "", description: "Monthly Tuition Fee", status: "pending" });
    showToast("Fee record added!");
  };

  const statusBadge = (status: string) => {
    if (status === "paid") return <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">✓ Paid</span>;
    if (status === "overdue") return <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">⚠ Overdue</span>;
    return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">⏳ Pending</span>;
  };

  const studentName = (id: string) => students.find((s) => s.id === id)?.name || "Unknown";

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-xl shadow-xl">
          ✅ {toast}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-600 text-white rounded-2xl p-5 shadow-lg">
          <p className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">Total Collected</p>
        </div>
        <div className="bg-red-500 text-white rounded-2xl p-5 shadow-lg">
          <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">Total Pending</p>
        </div>
        <div className="bg-indigo-600 text-white rounded-2xl p-5 shadow-lg col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold">{filtered.length}</p>
          <p className="text-sm opacity-80 mt-1">Records Shown</p>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap gap-3 items-end justify-between">
          <div className="flex flex-wrap gap-3">
            {user.role === "admin" && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="all">All Students</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
              <div className="flex gap-1.5">
                {(["all", "paid", "pending", "overdue"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition ${filterStatus === s ? "bg-indigo-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {user.role === "admin" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow"
            >
              + Add Record
            </button>
          )}
        </div>
      </div>

      {/* Fee Records */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 text-sm">Fee Records</h3>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-50">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No records found</p>
          )}
          {filtered.map((f) => (
            <div key={f.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  {user.role === "admin" && <p className="text-sm font-semibold text-gray-800">{studentName(f.studentId)}</p>}
                  <p className="text-sm font-medium text-gray-700">{f.description}</p>
                  <p className="text-xs text-gray-400">{f.month} • Due: {new Date(f.dueDate).toLocaleDateString("en-IN")}</p>
                </div>
                {statusBadge(f.status)}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-800">₹{f.amount.toLocaleString()}</p>
                {f.status === "paid" && f.paidOn && (
                  <p className="text-xs text-gray-400">Paid: {new Date(f.paidOn).toLocaleDateString("en-IN")}</p>
                )}
                {user.role === "admin" && f.status !== "paid" && (
                  <button onClick={() => markPaid(f)} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-600 transition">
                    Mark Paid
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {user.role === "admin" && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>}
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Month</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                {user.role === "admin" && <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-400 py-10">No records found</td></tr>
              )}
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50">
                  {user.role === "admin" && <td className="px-5 py-3 font-medium text-gray-800">{studentName(f.studentId)}</td>}
                  <td className="px-5 py-3 text-gray-700">{f.description}</td>
                  <td className="px-5 py-3 text-gray-500">{f.month}</td>
                  <td className="px-5 py-3 font-semibold text-gray-800">₹{f.amount.toLocaleString()}</td>
                  <td className="px-5 py-3 text-gray-500">{new Date(f.dueDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">{statusBadge(f.status)}</td>
                  {user.role === "admin" && (
                    <td className="px-5 py-3">
                      {f.status !== "paid" ? (
                        <button onClick={() => markPaid(f)} className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-green-600 transition">
                          Mark Paid
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">{f.paidOn ? new Date(f.paidOn).toLocaleDateString("en-IN") : "—"}</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Add Fee Record</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Student *</label>
                <select
                  value={newFee.studentId}
                  onChange={(e) => setNewFee({ ...newFee, studentId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Month *</label>
                  <input type="month" value={newFee.month} onChange={(e) => setNewFee({ ...newFee, month: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (₹) *</label>
                  <input type="number" value={newFee.amount} onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                    placeholder="2500" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Due Date *</label>
                <input type="date" value={newFee.dueDate} onChange={(e) => setNewFee({ ...newFee, dueDate: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <input type="text" value={newFee.description} onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                <select value={newFee.status} onChange={(e) => setNewFee({ ...newFee, status: e.target.value as any })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={addFee} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700">Add Record</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
